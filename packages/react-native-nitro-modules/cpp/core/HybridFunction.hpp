//
//  HybridFunction.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 07.08.24.
//

#pragma once

namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "CountTrailingOptionals.hpp"
#include "JSIConverter.hpp"
#include "TypeInfo.hpp"
#include <functional>
#include <jsi/jsi.h>
#include <memory>
#include <string>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents the type of a function - it can be either a normal function ("METHOD"),
 * or a property ("GETTER" + "SETTER")
 */
enum class FunctionType { METHOD, GETTER, SETTER };

/**
 * Represents a Hybrid Function.
 */
class HybridFunction final {
private:
  jsi::HostFunctionType _function;
  size_t _paramCount;
  std::string _name;

public:
  // getters
  inline const std::string& getName() const {
    return _name;
  }
  inline size_t getParamCount() const {
    return _paramCount;
  }
  inline const jsi::HostFunctionType& getHostFunction() const {
    return _function;
  }

public:
  // functions
  inline jsi::Function toJSFunction(jsi::Runtime& runtime) const {
    return jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, _name), _paramCount, _function);
  }

private:
  HybridFunction(jsi::HostFunctionType&& function, size_t paramCount, const std::string& name)
      : _function(std::move(function)), _paramCount(paramCount), _name(name) {}

public:
  /**
   * Create a new `HybridFunction` that can be called from JS.
   * This performs proper JSI -> C++ conversion using `JSIConverter<T>`,
   * and assumes that the object this is called on has a proper `this` configured.
   * The object's `this` needs to be a `NativeState`.
   */
  template <typename Derived, typename ReturnType, typename... Args>
  static inline HybridFunction createHybridFunction(const std::string& name, ReturnType (Derived::*method)(Args...), FunctionType type) {
    jsi::HostFunctionType hostFunction = [name, method, type](/* JS Runtime */ jsi::Runtime& runtime,
                                                              /* HybridObject */ const jsi::Value& thisValue,
                                                              /* JS arguments */ const jsi::Value* args,
                                                              /* argument size */ size_t count) -> jsi::Value {
    // 1. Get actual `HybridObject` instance from `thisValue` (it's stored as `NativeState`)
#if DEBUG
      if (!thisValue.isObject()) [[unlikely]] {
        throw jsi::JSError(runtime, "Cannot call hybrid function " + name + "(...) - `this` is not bound!");
      }
#endif
      jsi::Object thisObject = thisValue.getObject(runtime);

#if DEBUG
      if (!thisObject.hasNativeState<Derived>(runtime)) [[unlikely]] {
        if (thisObject.hasNativeState(runtime)) {
          throw jsi::JSError(runtime, "Cannot call hybrid function " + name + "(...) - `this` has a NativeState, but it's the wrong type!");
        } else {
          throw jsi::JSError(runtime, "Cannot call hybrid function " + name + "(...) - `this` does not have a NativeState!");
        }
      }
#endif
      std::shared_ptr<jsi::NativeState> nativeState = thisObject.getNativeState(runtime);
      std::shared_ptr<Derived> hybridInstance = std::dynamic_pointer_cast<Derived>(nativeState);

      // 2. Make sure the given arguments match, either with a static size, or with potentially optional arguments size.
      constexpr size_t optionalArgsCount = trailing_optionals_count_v<Args...>;
      constexpr size_t maxArgsCount = sizeof...(Args);
      constexpr size_t minArgsCount = maxArgsCount - optionalArgsCount;
      bool isWithinArgsRange = (count >= minArgsCount && count <= maxArgsCount);
      if (!isWithinArgsRange) [[unlikely]] {
        // invalid amount of arguments passed!
        std::string hybridObjectName = hybridInstance->getName();
        if constexpr (minArgsCount == maxArgsCount) {
          // min and max args length is the same, so we don't have any optional parameters. fixed count
          throw jsi::JSError(runtime, hybridObjectName + "." + name + "(...) expected " + std::to_string(maxArgsCount) +
                                          " arguments, but received " + std::to_string(count) + "!");
        } else {
          // min and max args length are different, so we have optional parameters - variable length arguments.
          throw jsi::JSError(runtime, hybridObjectName + "." + name + "(...) expected between " + std::to_string(minArgsCount) + " and " +
                                          std::to_string(maxArgsCount) + " arguments, but received " + std::to_string(count) + "!");
        }
      }

      // 3. Actually call method - either raw JSI method, or by going through `JSIConverter<T>` first.
      try {
        if constexpr (std::is_same_v<ReturnType, jsi::Value>) {
          // If the return type is a jsi::Value, we assume the user wants full JSI code control.
          // The signature must be identical to jsi::HostFunction (jsi::Runtime&, jsi::Value& this, ...)
          Derived* pointer = hybridInstance.get();
          return (pointer->*method)(runtime, thisValue, args, count);
        } else {
          // Call the actual method with JSI values as arguments and return a JSI value again.
          // Internally, this method converts the JSI values to C++ values.
          return callMethod(hybridInstance.get(), method, runtime, args, count, std::index_sequence_for<Args...>{});
        }
      } catch (const std::exception& exception) {
        // Some exception was thrown - add method name information and re-throw as `JSError`.
        std::string hybridObjectName = hybridInstance->getName();
        std::string message = exception.what();
        std::string suffix = type == FunctionType::METHOD ? "(...)" : "";
        throw jsi::JSError(runtime, hybridObjectName + "." + name + suffix + ": " + message);
      } catch (...) {
        // Some unknown exception was thrown - add method name information and re-throw as `JSError`.
        std::string hybridObjectName = hybridInstance->getName();
        std::string errorName = TypeInfo::getCurrentExceptionName();
        std::string suffix = type == FunctionType::METHOD ? "(...)" : "";
        throw jsi::JSError(runtime, hybridObjectName + "." + name + suffix + " threw an unknown " + errorName + " error.");
      }
    };

    return HybridFunction(std::move(hostFunction), sizeof...(Args), name);
  }

private:
  /**
   * Calls the given method on the given instance with the given `jsi::Value` arguments by converting them to the desired target types.
   * The given method's return value will be converted to a `jsi::Value` again.
   */
  template <typename Derived, typename ReturnType, typename... Args, size_t... Is>
  static inline jsi::Value callMethod(Derived* obj, ReturnType (Derived::*method)(Args...), jsi::Runtime& runtime, const jsi::Value* args,
                                      size_t argsSize, std::index_sequence<Is...>) {
    jsi::Value defaultValue;

    if constexpr (std::is_void_v<ReturnType>) {
      // It's a void method.
      (obj->*method)(JSIConverter<std::decay_t<Args>>::fromJSI(runtime, Is < argsSize ? args[Is] : defaultValue)...);
      return jsi::Value::undefined();
    } else {
      // It's returning some C++ type, we need to convert that to a JSI value now.
      ReturnType result = (obj->*method)(JSIConverter<std::decay_t<Args>>::fromJSI(runtime, Is < argsSize ? args[Is] : defaultValue)...);
      return JSIConverter<std::decay_t<ReturnType>>::toJSI(runtime, std::move(result));
    }
  }
};

} // namespace margelo::nitro
