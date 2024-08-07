//
//  HybridObjectPrototype.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 07.08.24.
//

#pragma once

#include "HybridFunction.hpp"
#include "OwningReference.hpp"
#include "PrototypeChain.hpp"
#include <functional>
#include <jsi/jsi.h>
#include <memory>
#include <mutex>
#include <string>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents a Hybrid Object's prototype.
 * The prototype should be cached per Runtime, and can be assigned to multiple jsi::Objects.
 * When assigned to a jsi::Object, all methods of this prototype can be called on that jsi::Object,
 * as long as it has a valid NativeState (`this`).
 */
class HybridObjectPrototype {
private:
  std::mutex _mutex;
  PrototypeChain _prototypeChain;
  bool _didLoadMethods = false;
  static constexpr auto TAG = "HybridObjectPrototype";

public:
  HybridObjectPrototype() {}

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
  /**
   * Registers the given C++ method as a Hybrid Method that can be called from JS, through the object's Prototype.
   * Example:
   * ```cpp
   * registerHybridMethod("sayHello", &MyObject::sayHello);
   * ```
   */
  template <typename Derived, typename ReturnType, typename... Args>
  inline void registerHybridMethod(std::string name, ReturnType (Derived::*method)(Args...)) {
    Prototype& prototype = _prototypeChain.extendPrototype<Derived>();

    if (prototype.getters.contains(name) || prototype.setters.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Method \"" + name + "\" - a property with that name already exists!");
    }
    if (prototype.methods.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Method \"" + name + "\" - a method with that name already exists!");
    }

    prototype.methods.emplace(name, HybridFunction::createHybridFunction(name, method, FunctionType::METHOD));
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
    Prototype& prototype = _prototypeChain.extendPrototype<Derived>();

    if (prototype.getters.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Getter \"" + name + "\" - a getter with that name already exists!");
    }
    if (prototype.methods.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Getter \"" + name + "\" - a method with that name already exists!");
    }

    prototype.getters.emplace(name, HybridFunction::createHybridFunction(name, method, FunctionType::GETTER));
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
    Prototype& prototype = _prototypeChain.extendPrototype<Derived>();

    if (prototype.setters.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Setter \"" + name + "\" - a setter with that name already exists!");
    }
    if (prototype.methods.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Setter \"" + name + "\" - a method with that name already exists!");
    }

    prototype.setters.emplace(name, HybridFunction::createHybridFunction(name, method, FunctionType::SETTER));
  }
};

} // namespace margelo::nitro
