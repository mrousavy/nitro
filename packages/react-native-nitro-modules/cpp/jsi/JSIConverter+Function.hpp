//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
class JSICache;

template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"

#include "Dispatcher.hpp"
#include "JSICache.hpp"
#include "PromiseType.hpp"
#include <functional>
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

// [](Args...) -> T {} <> (Args...) => T
template <typename ReturnType, typename... Args>
struct JSIConverter<std::function<ReturnType(Args...)>> final {
  // Promise<T> -> T
  using ResultingType = promise_type_v<ReturnType>;

  static inline std::function<ReturnType(Args...)> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    // Make function global - it'll be managed by the Runtime's memory, and we only have a weak_ref to it.
    auto cache = JSICache::getOrCreateCache(runtime);
    jsi::Function function = arg.asObject(runtime).asFunction(runtime);
    OwningReference<jsi::Function> sharedFunction = cache.makeShared(std::move(function));

    std::shared_ptr<Dispatcher> strongDispatcher = Dispatcher::getRuntimeGlobalDispatcher(runtime);
    std::weak_ptr<Dispatcher> weakDispatcher = strongDispatcher;

    // Create a C++ function that can be called by the consumer.
    // This will call the jsi::Function if it is still alive.
    return [&runtime, weakDispatcher = std::move(weakDispatcher), sharedFunction = std::move(sharedFunction)](Args... args) -> ReturnType {
      // Try to get the JS Dispatcher if the Runtime is still alive
      std::shared_ptr<Dispatcher> dispatcher = weakDispatcher.lock();
      if (!dispatcher) {
        if constexpr (std::is_void_v<ResultingType>) {
          Logger::log(LogLevel::Error, "JSIConverter",
                      "Tried calling void(..) function, but the JS Dispatcher has already been deleted by JS!");
          return;
        } else {
          throw std::runtime_error("Cannot call the given Function - the JS Dispatcher has already been destroyed by the JS Runtime!");
        }
      }

      if constexpr (std::is_void_v<ResultingType>) {
        dispatcher->runAsync([&runtime, sharedFunction = std::move(sharedFunction), ... args = std::move(args)]() {
          callJSFunction(runtime, sharedFunction, args...);
        });
      } else {
        return dispatcher->runAsyncAwaitable<ResultingType>(
            [&runtime, sharedFunction = std::move(sharedFunction), ... args = std::move(args)]() -> ResultingType {
              return callJSFunction(runtime, sharedFunction, args...);
            });
      }
    };
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, std::function<ReturnType(Args...)>&& function) {
    jsi::HostFunctionType jsFunction = [function = std::move(function)](jsi::Runtime& runtime, const jsi::Value&, const jsi::Value* args,
                                                                        size_t count) -> jsi::Value {
      if (count != sizeof...(Args)) [[unlikely]] {
        throw jsi::JSError(runtime, "Function expected " + std::to_string(sizeof...(Args)) + " arguments, but received " +
                                        std::to_string(count) + "!");
      }
      return callHybridFunction(function, runtime, args, std::index_sequence_for<Args...>{});
    };
    return jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, "hostFunction"), sizeof...(Args),
                                                 std::move(jsFunction));
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::function<ReturnType(Args...)>& function) {
    std::function<ReturnType(Args...)> copy = function;
    return toJSI(runtime, std::move(copy));
  }

  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (value.isObject()) {
      jsi::Object object = value.getObject(runtime);
      return object.isFunction(runtime);
    }
    return false;
  }

private:
  static inline ResultingType callJSFunction(jsi::Runtime& runtime, const OwningReference<jsi::Function>& function, const Args&... args) {
    if (!function) {
      if constexpr (std::is_void_v<ResultingType>) {
        // runtime has already been deleted. since this returns void, we can just ignore it being deleted.
        Logger::log(LogLevel::Error, "JSIConverter", "Tried calling void(..) function, but it has already been deleted by JS!");
        return;
      } else {
        // runtime has already been deleted, but we are expecting a return value - throw an error in this case.
        throw std::runtime_error("Cannot call the given Function - the JS Dispatcher has already been destroyed by the JS Runtime!");
      }
    }

    if constexpr (std::is_void_v<ResultingType>) {
      // It returns void. Just call the function
      function->call(runtime, JSIConverter<std::decay_t<Args>>::toJSI(runtime, args)...);
    } else {
      // It returns some kind of value - call the function, and convert the return value.
      jsi::Value result = function->call(runtime, JSIConverter<std::decay_t<Args>>::toJSI(runtime, args)...);
      return JSIConverter<ResultingType>::fromJSI(runtime, std::move(result));
    }
  }

  template <size_t... Is>
  static inline jsi::Value callHybridFunction(const std::function<ReturnType(Args...)>& function, jsi::Runtime& runtime,
                                              const jsi::Value* args, std::index_sequence<Is...>) {
    if constexpr (std::is_void_v<ReturnType>) {
      // it is a void function (will return undefined in JS)
      function(JSIConverter<std::decay_t<Args>>::fromJSI(runtime, args[Is])...);
      return jsi::Value::undefined();
    } else {
      // it is a custom type, parse it to a JS value
      ReturnType result = function(JSIConverter<std::decay_t<Args>>::fromJSI(runtime, args[Is])...);
      return JSIConverter<ReturnType>::toJSI(runtime, std::forward<ReturnType>(result));
    }
  }
};

} // namespace margelo::nitro
