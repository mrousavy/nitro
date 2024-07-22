//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

#include "JSIConverter.hpp"
#include "OwningReference.hpp"
#include "NitroLogger.hpp"
#include <functional>
#include <jsi/jsi.h>
#include <memory>
#include <mutex>
#include <type_traits>
#include <unordered_map>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents a C++ object that is exposed to JS.
 * `HybridObject`s can have native getters and setters, and normal methods.
 *
 * To implement a `HybridObject`, simply inherit from this class and override `loadHybridMethods`
 * to register the given getters, setters or methods.
 *
 * The new class can then be passed to JS using the `JSIConverter<HybridObject>`.
 */
class HybridObject : public jsi::HostObject, public std::enable_shared_from_this<HybridObject> {
public:
  struct HybridFunction {
    jsi::HostFunctionType function;
    size_t parameterCount;
  };

public:
  /**
   * Create a new instance of a `HybridObject`.
   * The given `name` will be used for logging and stringifying.
   */
  explicit HybridObject(const char* name);
  /**
   * Called when no more references to the given `HybridObject` exist in both C++ and JS.
   * JS might keep references for longer, as it is a garbage collected language.
   */
  ~HybridObject();
  /**
   * HybridObjects cannot be copied.
   */
  HybridObject(const HybridObject& copy) = delete;
  /**
   * HybridObjects cannot be moved.
   */
  HybridObject(HybridObject&& move) = delete;

public:
  void set(jsi::Runtime&, const jsi::PropNameID& name, const jsi::Value& value) override;
  jsi::Value get(jsi::Runtime& runtime, const jsi::PropNameID& propName) override;
  std::vector<jsi::PropNameID> getPropertyNames(jsi::Runtime& runtime) override;

public:
  /**
   * Get the `std::shared_ptr` instance of this HybridObject.
   * The HybridObject must be managed inside a `shared_ptr` already, otherwise this will fail.
   */
  template <typename Derived> std::shared_ptr<Derived> shared() {
    return std::static_pointer_cast<Derived>(shared_from_this());
  }
  
public:
  /**
   * Get the HybridObject's name
   */
  std::string getName();
  /**
   * Get a string representation of this HostObject, useful for logging or debugging.
   */
  virtual std::string toString();
  /**
   * Compare this HybridObject for reference equality to the other HybridObject.
   *
   * While two `jsi::Object`s of the same `HybridObject` might not be equal when compared with `==`,
   * they might still be the same `HybridObject` - in this case `equals(other)` will return true.
   */
  bool equals(std::shared_ptr<HybridObject> other);

protected:
  /**
   * Loads all native methods of this `HybridObject` to be exposed to JavaScript.
   * The base implementation registers a `toString()` method and `name` property.
   *
   * Example:
   *
   * ```cpp
   * int User::getAge() {
   *   return 23;
   * }
   *
   * void User::loadHybridMethods() {
   *   HybridObject::loadHybridMethods();
   *   registerHybridMethod("getAge", &User::getAge, this);
   * }
   * ```
   */
  virtual void loadHybridMethods();

private:
  static constexpr auto TAG = "HybridObject";
  const char* _name = TAG;
  int _instanceId = 1;
  bool _didLoadMethods = false;
  std::unique_ptr<std::mutex> _mutex;
  std::unordered_map<std::string, HybridFunction> _methods;
  std::unordered_map<std::string, jsi::HostFunctionType> _getters;
  std::unordered_map<std::string, jsi::HostFunctionType> _setters;
  std::unordered_map<jsi::Runtime*, std::unordered_map<std::string, OwningReference<jsi::Function>>> _functionCache;

private:
  inline void ensureInitialized(facebook::jsi::Runtime& runtime);

private:
  template <typename Derived, typename ReturnType, typename... Args, size_t... Is>
  static inline jsi::Value callMethod(Derived* obj, ReturnType (Derived::*method)(Args...), jsi::Runtime& runtime, const jsi::Value* args,
                                      std::index_sequence<Is...>) {
    if constexpr (std::is_same_v<ReturnType, void>) {
      // It's a void method.
      (obj->*method)(JSIConverter<std::decay_t<Args>>::fromJSI(runtime, args[Is])...);
      return jsi::Value::undefined();
    } else {
      // It's returning some C++ type, we need to convert that to a JSI value now.
      ReturnType result = (obj->*method)(JSIConverter<std::decay_t<Args>>::fromJSI(runtime, args[Is])...);
      return JSIConverter<std::decay_t<ReturnType>>::toJSI(runtime, std::move(result));
    }
  }

  template <typename Derived, typename ReturnType, typename... Args>
  static inline jsi::HostFunctionType createHybridMethod(std::string name, ReturnType (Derived::*method)(Args...), Derived* derivedInstance) {
    return [name, derivedInstance, method](jsi::Runtime& runtime, const jsi::Value& thisVal, const jsi::Value* args, size_t count) -> jsi::Value {
      if (count != sizeof...(Args)) {
        // invalid amount of arguments passed!
        throw jsi::JSError(runtime, "Function " + name + "(...) expected " + std::to_string(sizeof...(Args)) + " arguments, but received " + std::to_string(count) + "!");
      }

      if constexpr (std::is_same_v<ReturnType, jsi::Value>) {
        // If the return type is a jsi::Value, we assume the user wants full JSI code control.
        // The signature must be identical to jsi::HostFunction (jsi::Runtime&, jsi::Value& this, ...)
        return (derivedInstance->*method)(runtime, thisVal, args, count);
      } else {
        // Call the actual method with JSI values as arguments and return a JSI value again.
        // Internally, this method converts the JSI values to C++ values.
        return callMethod(derivedInstance, method, runtime, args, std::index_sequence_for<Args...>{});
      }
    };
  }

protected:
  template <typename Derived, typename ReturnType, typename... Args>
  inline void registerHybridMethod(std::string name, ReturnType (Derived::*method)(Args...), Derived* derivedInstance) {
    if (_getters.contains(name) || _setters.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Method \"" + name + "\" - a property with that name already exists!");
    }
    if (_methods.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Method \"" + name + "\" - a method with that name already exists!");
    }

    _methods[name] = HybridFunction{.function = createHybridMethod(name, method, derivedInstance), .parameterCount = sizeof...(Args)};
  }

  template <typename Derived, typename ReturnType>
  inline void registerHybridGetter(std::string name, ReturnType (Derived::*method)(), Derived* derivedInstance) {
    if (_getters.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Getter \"" + name + "\" - a getter with that name already exists!");
    }
    if (_methods.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Getter \"" + name + "\" - a method with that name already exists!");
    }

    _getters[name] = createHybridMethod(name, method, derivedInstance);
  }

  template <typename Derived, typename ValueType>
  inline void registerHybridSetter(std::string name, void (Derived::*method)(ValueType), Derived* derivedInstance) {
    if (_setters.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Setter \"" + name + "\" - a setter with that name already exists!");
    }
    if (_methods.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Setter \"" + name + "\" - a method with that name already exists!");
    }

    _setters[name] = createHybridMethod(name, method, derivedInstance);
  }
};

} // namespace margelo::nitro
