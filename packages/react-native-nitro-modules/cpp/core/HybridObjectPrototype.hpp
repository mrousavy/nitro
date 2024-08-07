//
//  HybridObjectPrototype.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 07.08.24.
//

#pragma once

namespace margelo::nitro {
class HybridObject;
class HybridObjectPrototype;
}

#include "CountTrailingOptionals.hpp"
#include "JSIConverter.hpp"
#include "OwningReference.hpp"
#include "TypeInfo.hpp"
#include <functional>
#include <jsi/jsi.h>
#include <memory>
#include <type_traits>
#include <string>
#include <mutex>
#include <vector>
#include <typeindex>

namespace margelo::nitro {

using namespace facebook;

enum class MethodType { METHOD, GETTER, SETTER };

/**
 * Represents a Hybrid Object's prototype.
 * The prototype should be cached per Runtime, and can be assigned to multiple jsi::Objects.
 * When assigned to a jsi::Object, all methods of this prototype can be called on that jsi::Object,
 * as long as it has a valid NativeState (`this`).
 */
class HybridObjectPrototype {
private:
  struct HybridFunction {
    jsi::HostFunctionType function;
    size_t parameterCount;
    
    jsi::Function toJS(jsi::Runtime& runtime, const char* name) const {
      return jsi::Function::createFromHostFunction(runtime,
                                                   jsi::PropNameID::forUtf8(runtime, name),
                                                   parameterCount,
                                                   function);
    }
  };
  
  using NativeInstanceId = std::type_index;
  struct Prototype {
    Prototype* child = nullptr;
    NativeInstanceId instanceTypeId;
    std::unordered_map<std::string, HybridFunction> methods;
    std::unordered_map<std::string, HybridFunction> getters;
    std::unordered_map<std::string, HybridFunction> setters;
    
    static Prototype* create(const std::type_info& typeId) {
      return new Prototype {
        .instanceTypeId = std::type_index(typeId)
      };
    }
    ~Prototype() {
      delete child;
    }
  };
  
private:
  std::mutex _mutex;
  Prototype* _prototype;
  bool _didLoadMethods = false;
  static constexpr auto TAG = "HybridObjectPrototype";
  
public:
  HybridObjectPrototype(): _prototype(Prototype::create(typeid(this))) { }
  ~HybridObjectPrototype() {
    delete _prototype;
  }
  
public:
  /**
   * Get a fully initialized jsi::Object that represents this prototype to JS.
   * The result of this value will be cached per Runtime, so it's safe to call this often.
   */
  jsi::Object getPrototype(jsi::Runtime& runtime);
  
private:
  static jsi::Object createPrototype(jsi::Runtime& runtime, Prototype* prototype);
  using PrototypeCache = std::unordered_map<NativeInstanceId, OwningReference<jsi::Object>>;
  static std::unordered_map<jsi::Runtime*, PrototypeCache> _prototypeCache;
  
protected:
  /**
   * Loads all Hybrid Methods that will be initialized in this Prototype.
   * This will only be called once for the first time the Prototype will be created,
   * so don't conditionally register methods.
   */
  virtual void loadHybridMethods() = 0;
  
private:
  /**
   * Ensures that all Hybrid Methods, Getters and Setters are initialized by calling loadHybridMethods().
   */
  void ensureInitialized();
  
protected:
  template <typename Derived>
  inline Prototype& getCppPrototypeChain(Prototype* base) {
    // If the Prototype represents the caller instance's ID (`Derived`), we work with this Prototype.
    if (base->instanceTypeId == std::type_index(typeid(Derived))) {
      return *base;
    } else {
      if (base->child != nullptr) {
        // Otherwise let's try it's child!
        return getCppPrototypeChain<Derived>(base->child);
      } else {
        // Otherwise we need to create a new child prototype in that chain
        base->child = Prototype::create(typeid(Derived));
        return getCppPrototypeChain<Derived>(base->child);
      }
    }
  }
  
  /**
   * Registers the given C++ method as a Hybrid Method that can be called from JS, through the object's Prototype.
   * Example:
   * ```cpp
   * registerHybridMethod("sayHello", &MyObject::sayHello);
   * ```
   */
  template <typename Derived, typename ReturnType, typename... Args>
  inline void registerHybridMethod(std::string name, ReturnType (Derived::*method)(Args...)) {
    Prototype& prototype = getCppPrototypeChain<Derived>(_prototype);
    
    if (prototype.getters.contains(name) || prototype.setters.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Method \"" + name + "\" - a property with that name already exists!");
    }
    if (prototype.methods.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Method \"" + name + "\" - a method with that name already exists!");
    }

    prototype.methods[name] = HybridFunction{
      .function = createHybridMethod(name, method, MethodType::METHOD),
      .parameterCount = sizeof...(Args)
    };
  }

  /**
   * Registers the given C++ method as a property getter that can be called from JS, through the object's Prototype.
   * Example:
   * ```cpp
   * registerHybridGetter("foo", &MyObject::getFoo);
   * ```
   */
  template <typename Derived, typename ReturnType>
  inline void registerHybridGetter(std::string name, ReturnType (Derived::*method)()) {
    Prototype& prototype = getCppPrototypeChain<Derived>(_prototype);
    
    if (prototype.getters.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Getter \"" + name + "\" - a getter with that name already exists!");
    }
    if (prototype.methods.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Getter \"" + name + "\" - a method with that name already exists!");
    }

    prototype.getters[name] = HybridFunction {
      .function = createHybridMethod(name, method, MethodType::GETTER),
      .parameterCount = 0
    };
  }

  /**
   * Registers the given C++ method as a property setter that can be called from JS, through the object's Prototype.
   * Example:
   * ```cpp
   * registerHybridSetter("foo", &MyObject::setFoo);
   * ```
   */
  template <typename Derived, typename ValueType>
  inline void registerHybridSetter(std::string name, void (Derived::*method)(ValueType)) {
    Prototype& prototype = getCppPrototypeChain<Derived>(_prototype);
    
    if (prototype.setters.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Setter \"" + name + "\" - a setter with that name already exists!");
    }
    if (prototype.methods.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Setter \"" + name + "\" - a method with that name already exists!");
    }

    prototype.setters[name] = HybridFunction {
      .function = createHybridMethod(name, method, MethodType::SETTER),
      .parameterCount = 1
    };
  }
  
private:
  /**
   * Create a new JSI method that can be called from JS.
   * This performs proper JSI -> C++ conversion using `JSIConverter<T>`,
   * and assumes that the object this is called on has a proper `this` configured.
   * The object's `this` needs to be a `NativeState`.
   */
  template <typename Derived, typename ReturnType, typename... Args>
  static inline jsi::HostFunctionType createHybridMethod(std::string name, ReturnType (Derived::*method)(Args...), MethodType type) {
    return [name, method, type](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* args, size_t count) -> jsi::Value {
      if (!thisValue.isObject()) [[unlikely]] {
        throw std::runtime_error("Cannot call hybrid function " + name + "(...) - `this` is not bound!");
      }
      jsi::Object thisObject = thisValue.getObject(runtime);
      if (!thisObject.hasNativeState<Derived>(runtime)) [[unlikely]] {
        if (thisObject.hasNativeState(runtime)) {
          throw std::runtime_error("Cannot call hybrid function " + name + "(...) - `this` has a NativeState, but it's the wrong type!");
        } else {
          throw std::runtime_error("Cannot call hybrid function " + name + "(...) - `this` does not have a NativeState!");
        }
      }
      auto hybridInstance = thisObject.getNativeState<Derived>(runtime);

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

      try {
        if constexpr (std::is_same_v<ReturnType, jsi::Value>) {
          // If the return type is a jsi::Value, we assume the user wants full JSI code control.
          // The signature must be identical to jsi::HostFunction (jsi::Runtime&, jsi::Value& this, ...)
          return (hybridInstance->*method)(runtime, thisValue, args, count);
        } else {
          // Call the actual method with JSI values as arguments and return a JSI value again.
          // Internally, this method converts the JSI values to C++ values.
          return callMethod(hybridInstance.get(), method, runtime, args, count, std::index_sequence_for<Args...>{});
        }
      } catch (const std::exception& exception) {
        std::string hybridObjectName = hybridInstance->getName();
        std::string message = exception.what();
        std::string suffix = type == MethodType::METHOD ? "(...)" : "";
        throw jsi::JSError(runtime, hybridObjectName + "." + name + suffix + ": " + message);
      } catch (...) {
        std::string hybridObjectName = hybridInstance->getName();
        std::string errorName = TypeInfo::getCurrentExceptionName();
        std::string suffix = type == MethodType::METHOD ? "(...)" : "";
        throw jsi::JSError(runtime, hybridObjectName + "." + name + suffix + " threw an unknown " + errorName + " error.");
      }
    };
  }
  
  
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
