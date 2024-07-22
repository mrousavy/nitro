//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

namespace margelo::nitro { class HybridObject; }

#include "HybridObject.hpp"
#include "Promise.hpp"
#include "Dispatcher.hpp"
#include "JSICache.hpp"
#include "ArrayBuffer.hpp"
#include "Hash.hpp"
#include "TypeInfo.hpp"
#include <array>
#include <future>
#include <jsi/jsi.h>
#include <memory>
#include <type_traits>
#include <unordered_map>

#define JSI_CONVERTER_AVAILABLE

#define DO_NULL_CHECKS true

namespace margelo::nitro {

/**
 The JSIConverter<T> class can convert any type from and to a jsi::Value.
 It uses templates to statically create fromJSI/toJSI methods, and will throw compile-time errors
 if a given type is not convertable.
 Value types, custom types (HostObjects), and even functions with any number of arguments/types are supported.
 This type can be extended by just creating a new template for JSIConverter in a header.
 */

using namespace facebook;

// Unknown type (error)
template <typename ArgType, typename Enable = void> struct JSIConverter final {
  JSIConverter() = delete;

  static inline ArgType fromJSI(jsi::Runtime&, const jsi::Value&) {
    static_assert(always_false<ArgType>::value, "This type is not supported by the JSIConverter!");
    return ArgType();
  }
  static inline jsi::Value toJSI(jsi::Runtime&, ArgType) {
    static_assert(always_false<ArgType>::value, "This type is not supported by the JSIConverter!");
    return jsi::Value::undefined();
  }

private:
  template <typename> struct always_false : std::false_type {};
};

// int <> number
template <> struct JSIConverter<int> {
  static inline int fromJSI(jsi::Runtime&, const jsi::Value& arg) {
    return static_cast<int>(arg.asNumber());
  }
  static inline jsi::Value toJSI(jsi::Runtime&, int arg) {
    return jsi::Value(arg);
  }
};

// double <> number
template <> struct JSIConverter<double> {
  static inline double fromJSI(jsi::Runtime&, const jsi::Value& arg) {
    return arg.asNumber();
  }
  static inline jsi::Value toJSI(jsi::Runtime&, double arg) {
    return jsi::Value(arg);
  }
};

// float <> number
template <> struct JSIConverter<float> {
  static inline float fromJSI(jsi::Runtime&, const jsi::Value& arg) {
    return static_cast<float>(arg.asNumber());
  }
  static inline jsi::Value toJSI(jsi::Runtime&, float arg) {
    return jsi::Value(static_cast<double>(arg));
  }
};

// int64_t <> BigInt
template <> struct JSIConverter<int64_t> {
  static inline double fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    return arg.asBigInt(runtime).asInt64(runtime);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, int64_t arg) {
    return jsi::BigInt::fromInt64(runtime, arg);
  }
};

// uint64_t <> BigInt
template <> struct JSIConverter<uint64_t> {
  static inline double fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    return arg.asBigInt(runtime).asUint64(runtime);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, uint64_t arg) {
    return jsi::BigInt::fromUint64(runtime, arg);
  }
};

// bool <> boolean
template <> struct JSIConverter<bool> {
  static inline bool fromJSI(jsi::Runtime&, const jsi::Value& arg) {
    return arg.asBool();
  }
  static inline jsi::Value toJSI(jsi::Runtime&, bool arg) {
    return jsi::Value(arg);
  }
};

// std::string <> string
template <> struct JSIConverter<std::string> {
  static inline std::string fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    return arg.asString(runtime).utf8(runtime);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::string& arg) {
    return jsi::String::createFromUtf8(runtime, arg);
  }
};

// std::optional<T> <> T | undefined
template <typename TInner> struct JSIConverter<std::optional<TInner>> {
  static inline std::optional<TInner> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    if (arg.isUndefined() || arg.isNull()) {
      return std::nullopt;
    } else {
      return JSIConverter<TInner>::fromJSI(runtime, std::move(arg));
    }
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::optional<TInner>& arg) {
    if (arg == std::nullopt) {
      return jsi::Value::undefined();
    } else {
      return JSIConverter<TInner>::toJSI(runtime, arg.value());
    }
  }
};

// std::future<T> <> Promise<T>
template <typename TResult> struct JSIConverter<std::future<TResult>> {
  static inline std::future<TResult> fromJSI(jsi::Runtime&, const jsi::Value&) {
    throw std::runtime_error("Promise cannot be converted to a native type - it needs to be awaited first!");
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, std::future<TResult>&& arg) {
    auto sharedFuture = std::make_shared<std::future<TResult>>(std::move(arg));
    auto dispatcher = Dispatcher::getRuntimeGlobalDispatcher(runtime);

    return Promise::createPromise(runtime, [sharedFuture, dispatcher](jsi::Runtime& runtime,
                                                                      std::shared_ptr<Promise> promise) {
      // Spawn new async thread to synchronously wait for the `future<T>` to complete
      std::thread waiterThread([promise, &runtime, dispatcher, sharedFuture]() {
        // synchronously wait until the `future<T>` completes. we are running on a background task here.
        sharedFuture->wait();

        // the async function completed successfully, resolve the promise on JS Thread
        dispatcher->runAsync([&runtime, promise, sharedFuture]() mutable {
          try {
            if constexpr (std::is_same_v<TResult, void>) {
              // it's returning void, just return undefined to JS
              sharedFuture->get();
              promise->resolve(runtime, jsi::Value::undefined());
            } else {
              // it's returning a custom type, convert it to a jsi::Value
              TResult result = sharedFuture->get();
              jsi::Value jsResult = JSIConverter<TResult>::toJSI(runtime, result);
              promise->resolve(runtime, std::move(jsResult));
            }
          } catch (const std::exception& exception) {
            // the async function threw an error, reject the promise on JS Thread
            std::string what = exception.what();
            promise->reject(runtime, what);
          } catch (...) {
            // the async function threw a non-std error, try getting it
            std::string name = TypeInfo::getCurrentExceptionName();
            promise->reject(runtime, "Unknown non-std exception: " + name);
          }

          // This lambda owns the promise shared pointer, and we need to call its
          // destructor on the correct thread here - otherwise it might be called
          // from the waiterThread.
          promise = nullptr;
        });
      });
      waiterThread.detach();
    });
  }
};

// [](Args...) -> T {} <> (Args...) => T
template <typename ReturnType, typename... Args> struct JSIConverter<std::function<ReturnType(Args...)>> {
  static inline std::function<ReturnType(Args...)> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    // Make function global - it'll be managed by the Runtime's memory, and we only have a weak_ref to it.
    auto cache = JSICache<jsi::Function>::getOrCreateCache(runtime).lock();
    jsi::Function function = arg.asObject(runtime).asFunction(runtime);
    OwningReference<jsi::Function> sharedFunction = cache->makeGlobal(std::move(function));

    // Create a C++ function that can be called by the consumer.
    // This will call the jsi::Function if it is still alive.
    return [&runtime, sharedFunction](Args... args) -> ReturnType {
      if constexpr (std::is_same_v<ReturnType, void>) {
        // it is a void function (returns undefined)
        if (!sharedFunction) {
          // runtime has already been deleted. since this returns void, we can just ignore it being deleted.
          return;
        }
        sharedFunction->call(runtime, JSIConverter<std::decay_t<Args>>::toJSI(runtime, args)...);
        return;
      } else {
        // it returns a custom type, parse it from the JSI value.
        if (!sharedFunction) {
          // runtime has already been deleted. since we expect a return value here, we need to throw.
          throw std::runtime_error("Cannot call the given Function - the Runtime has already been destroyed!");
        }
        jsi::Value result = sharedFunction->call(runtime, JSIConverter<std::decay_t<Args>>::toJSI(runtime, args)...);
        return JSIConverter<ReturnType>::fromJSI(runtime, std::move(result));
      }
    };
  }

  template <size_t... Is>
  static inline jsi::Value callHybridFunction(const std::function<ReturnType(Args...)>& function, jsi::Runtime& runtime, const jsi::Value* args,
                                              std::index_sequence<Is...>) {
    if constexpr (std::is_same_v<ReturnType, void>) {
      // it is a void function (will return undefined in JS)
      function(JSIConverter<std::decay_t<Args>>::fromJSI(runtime, args[Is])...);
      return jsi::Value::undefined();
    } else {
      // it is a custom type, parse it to a JS value
      ReturnType result = function(JSIConverter<std::decay_t<Args>>::fromJSI(runtime, args[Is])...);
      return JSIConverter<ReturnType>::toJSI(runtime, result);
    }
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::function<ReturnType(Args...)>& function) {
    jsi::HostFunctionType jsFunction = [function = std::move(function)](jsi::Runtime& runtime, const jsi::Value& thisValue,
                                                                        const jsi::Value* args, size_t count) -> jsi::Value {
      if (count != sizeof...(Args)) [[unlikely]] {
        throw jsi::JSError(runtime, "Function expected " + std::to_string(sizeof...(Args)) + " arguments, but received " +
                                        std::to_string(count) + "!");
      }
      return callHybridFunction(function, runtime, args, std::index_sequence_for<Args...>{});
    };
    return jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, "hostFunction"), sizeof...(Args), jsFunction);
  }
};

// std::vector<T> <> T[]
template <typename ElementType> struct JSIConverter<std::vector<ElementType>> {
  static inline std::vector<ElementType> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Array array = arg.asObject(runtime).asArray(runtime);
    size_t length = array.size(runtime);

    std::vector<ElementType> vector;
    vector.reserve(length);
    for (size_t i = 0; i < length; ++i) {
      jsi::Value elementValue = array.getValueAtIndex(runtime, i);
      vector.emplace_back(JSIConverter<ElementType>::fromJSI(runtime, elementValue));
    }
    return vector;
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::vector<ElementType>& vector) {
    jsi::Array array(runtime, vector.size());
    for (size_t i = 0; i < vector.size(); i++) {
      jsi::Value value = JSIConverter<ElementType>::toJSI(runtime, vector[i]);
      array.setValueAtIndex(runtime, i, std::move(value));
    }
    return array;
  }
};

// std::unordered_map<std::string, T> <> Record<string, T>
template <typename ValueType> struct JSIConverter<std::unordered_map<std::string, ValueType>> {
  static inline std::unordered_map<std::string, ValueType> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    jsi::Array propertyNames = object.getPropertyNames(runtime);
    size_t length = propertyNames.size(runtime);

    std::unordered_map<std::string, ValueType> map;
    map.reserve(length);
    for (size_t i = 0; i < length; ++i) {
      std::string key = propertyNames.getValueAtIndex(runtime, i).asString(runtime).utf8(runtime);
      jsi::Value value = object.getProperty(runtime, key.c_str());
      map.emplace(key, JSIConverter<ValueType>::fromJSI(runtime, value));
    }
    return map;
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::unordered_map<std::string, ValueType>& map) {
    jsi::Object object(runtime);
    for (const auto& pair : map) {
      jsi::Value value = JSIConverter<ValueType>::toJSI(runtime, pair.second);
      object.setProperty(runtime, pair.first.c_str(), std::move(value));
    }
    return object;
  }
};

// MutableBuffer <> ArrayBuffer
template <> struct JSIConverter<std::shared_ptr<jsi::MutableBuffer>> {
  static inline std::shared_ptr<ArrayBuffer> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    if (!object.isArrayBuffer(runtime)) [[unlikely]] {
      throw std::runtime_error("Object \"" + arg.toString(runtime).utf8(runtime) + "\" is not an ArrayBuffer!");
    }
    jsi::ArrayBuffer arrayBuffer = object.getArrayBuffer(runtime);
    return std::make_shared<ArrayBuffer>(arrayBuffer.data(runtime), arrayBuffer.size(runtime));
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, std::shared_ptr<jsi::MutableBuffer> buffer) {
    return jsi::ArrayBuffer(runtime, buffer);
  }
};

// HybridObject <> {}
template <typename T> struct is_shared_ptr_to_host_object : std::false_type {};
template <typename T> struct is_shared_ptr_to_host_object<std::shared_ptr<T>> : std::is_base_of<jsi::HostObject, T> {};
template <typename T> struct JSIConverter<T, std::enable_if_t<is_shared_ptr_to_host_object<T>::value>> {
  using TPointee = typename T::element_type;

  static inline std::string invalidTypeErrorMessage(const std::string& typeDescription, const std::string& reason) {
    std::string typeName = TypeInfo::getFriendlyTypename<TPointee>();
    return "Cannot convert \"" + typeDescription + "\" to HostObject<" + typeName + ">! " + reason;
  }

  static inline T fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
#if DO_NULL_CHECKS
    if (arg.isUndefined()) [[unlikely]] {
      throw jsi::JSError(runtime, invalidTypeErrorMessage("undefined", "It is undefined!"));
    }
    if (!arg.isObject()) [[unlikely]] {
      std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
      throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It is not an object!"));
    }
#endif
    jsi::Object object = arg.asObject(runtime);
#if DO_NULL_CHECKS
    if (!object.isHostObject<TPointee>(runtime)) [[unlikely]] {
      std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
      throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It is a different HostObject<T>!"));
    }
#endif
    return object.asHostObject<TPointee>(runtime);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const T& arg) {
#if DO_NULL_CHECKS
    if (arg == nullptr) [[unlikely]] {
      std::string typeName = TypeInfo::getFriendlyTypename<TPointee>();
      throw jsi::JSError(runtime, "Cannot convert nullptr to HostObject<" + typeName + ">!");
    }
#endif
    jsi::Object object = jsi::Object::createFromHostObject(runtime, arg);
    if constexpr (std::is_base_of_v<HybridObject, TPointee>) {
      // HybridObjects expose their external memory size, so inform JS GC about it!
      size_t memorySize = arg->getTotalExternalMemorySize();
      object.setExternalMemoryPressure(runtime, memorySize);
      Logger::log("SIZE", "Memory size is %i!!!", memorySize);
    }
    return object;
  }
};

// NativeState <> {}
template <typename T> struct is_shared_ptr_to_native_state : std::false_type {};
template <typename T> struct is_shared_ptr_to_native_state<std::shared_ptr<T>> : std::is_base_of<jsi::NativeState, T> {};
template <typename T> struct JSIConverter<T, std::enable_if_t<is_shared_ptr_to_native_state<T>::value>> {
  using TPointee = typename T::element_type;

  static inline std::string invalidTypeErrorMessage(const std::string& typeDescription, const std::string& reason) {
    std::string typeName = TypeInfo::getFriendlyTypename<TPointee>();
    return "Cannot convert \"" + typeDescription + "\" to NativeState<" + typeName + ">! " + reason;
  }

  static inline T fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
#if DO_NULL_CHECKS
    if (arg.isUndefined()) [[unlikely]] {
      throw jsi::JSError(runtime, invalidTypeErrorMessage("undefined", "It is undefined!"));
    }
    if (!arg.isObject()) [[unlikely]] {
      std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
      throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It is not an object!"));
    }
#endif
    jsi::Object object = arg.asObject(runtime);
#if DO_NULL_CHECKS
    if (!object.hasNativeState<TPointee>(runtime)) [[unlikely]] {
      std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
      throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It is a different NativeState<T>!"));
    }
#endif
    return object.getNativeState<TPointee>(runtime);
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const T& arg) {
#if DO_NULL_CHECKS
    if (arg == nullptr) [[unlikely]] {
      std::string typeName = TypeInfo::getFriendlyTypename<TPointee>();
      throw jsi::JSError(runtime, "Cannot convert nullptr to NativeState<" + typeName + ">!");
    }
#endif
    jsi::Object object(runtime);
    object.setNativeState(runtime, arg);
    return object;
  }
};

} // namespace margelo::nitro
