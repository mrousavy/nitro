//
//  PrototypeChain.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 07.08.24.
//

#pragma once

#include "HybridFunction.hpp"
#include <string>
#include <typeindex>
#include <unordered_map>
#include <memory>
#include "NitroLogger.hpp"

namespace margelo::nitro {

/**
 * Represents a Prototype's native C++ type ID.
 * This can be used to identify a prototype against a C++ instance,
 * or used as a cache-key.
 */
using NativeInstanceId = std::type_index;

/**
 * Represents a `Prototype`'s structure.
 * Every prototype has a related C++ type ID (`instanceTypeId`).
 * Prototypes can be sub-classes, in which case they have a `base` prototype.
 * Each prototype has a list of methods, and properties (getters + setters).
 */
struct Prototype final {
private:
  std::shared_ptr<Prototype> _base = nullptr;
  NativeInstanceId _instanceTypeId;
  std::unordered_map<std::string, HybridFunction> _methods;
  std::unordered_map<std::string, HybridFunction> _getters;
  std::unordered_map<std::string, HybridFunction> _setters;
  
private:
  
private:
  Prototype(const NativeInstanceId& typeId, const std::shared_ptr<Prototype>& base) :
    _instanceTypeId(typeId), _base(base) {}

public:
  /**
   * Gets a `Prototype` specification/node for the given native C++ type ID.
   *
   * If the given C++ type ID is unknown, a new `Prototype` node is created,
   * which has to be initialized with methods, getters and setters first.
   *
   * If the given C++ type ID is already known in the static `Prototype` tree,
   * a shared reference to it is returned.
   */
  static std::shared_ptr<Prototype> get(const NativeInstanceId& typeId,
                                        const std::shared_ptr<Prototype>& base = nullptr) {
    static std::unordered_map<NativeInstanceId, std::shared_ptr<Prototype>> _prototypesCache;
    
    const auto& found = _prototypesCache.find(typeId);
    if (found != _prototypesCache.end()) {
      // We know this C++ type ID / Prototype - return it!
      Logger::log("Prototype", "Found %s in Prototype cache - re-using it!", typeId.name());
      return found->second;
    } else {
      // This is the first time we see this C++ type ID - create a new base Prototype for this.
      Logger::log("Prototype", "Creating Prototype for %s...", typeId.name());
      auto prototype = std::shared_ptr<Prototype>(new Prototype(typeId, base));
      _prototypesCache.emplace(typeId, prototype);
      return prototype;
    }
  }

public:
  template <typename T>
  inline bool isNativeInstance() const noexcept {
    return _instanceTypeId == std::type_index(typeid(T));
  }

  inline bool hasBase() const noexcept {
    return _base != nullptr;
  }
  
  inline const std::shared_ptr<Prototype>& getBase() const noexcept {
    return _base;
  }
  
  inline bool hasHybrids() const {
    return !_methods.empty() || !_getters.empty() || !_setters.empty();
  }
  
  inline const NativeInstanceId& getNativeInstanceId() const noexcept { return _instanceTypeId; }
  inline const std::unordered_map<std::string, HybridFunction>& getMethods() const noexcept { return _methods; }
  inline const std::unordered_map<std::string, HybridFunction>& getGetters() const noexcept { return _getters; }
  inline const std::unordered_map<std::string, HybridFunction>& getSetters() const noexcept { return _setters; }
  
public:
  /**
   * Registers the given C++ method as a Hybrid Method that can be called from JS, through the object's Prototype.
   * Example:
   * ```cpp
   * registerHybridMethod("sayHello", &MyObject::sayHello);
   * ```
   */
  template <typename Derived, typename ReturnType, typename... Args>
  inline void registerHybridMethod(std::string name, ReturnType (Derived::*method)(Args...)) {
    if (_getters.contains(name) || _setters.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Method \"" + name + "\" - a property with that name already exists!");
    }
    if (_methods.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Method \"" + name + "\" - a method with that name already exists!");
    }

    _methods.emplace(name, HybridFunction::createHybridFunction(name, method, FunctionType::METHOD));
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
    if (_getters.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Getter \"" + name + "\" - a getter with that name already exists!");
    }
    if (_methods.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Getter \"" + name + "\" - a method with that name already exists!");
    }

    _getters.emplace(name, HybridFunction::createHybridFunction(name, method, FunctionType::GETTER));
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
    if (_setters.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Setter \"" + name + "\" - a setter with that name already exists!");
    }
    if (_methods.contains(name)) [[unlikely]] {
      throw std::runtime_error("Cannot add Hybrid Property Setter \"" + name + "\" - a method with that name already exists!");
    }

    _setters.emplace(name, HybridFunction::createHybridFunction(name, method, FunctionType::SETTER));
  }
};

} // namespace margelo::nitro
