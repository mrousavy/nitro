//
//  PrototypeChain.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 07.08.24.
//

#pragma once

#include "HybridFunction.hpp"
#include <jsi/jsi.h>
#include <string>
#include <typeindex>
#include <unordered_map>

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
  Prototype* base = nullptr;
  NativeInstanceId instanceTypeId;
  std::unordered_map<std::string, HybridFunction> methods;
  std::unordered_map<std::string, HybridFunction> getters;
  std::unordered_map<std::string, HybridFunction> setters;

  static Prototype* create(const std::type_info& typeId) {
    return new Prototype{.instanceTypeId = std::type_index(typeId)};
  }
  ~Prototype() {
    delete base;
  }
};

/**
 * Represents a mutable chain of prototypes.
 * Callers can use this class to incrementally add sub-classes to prototypes and build
 * prototype chains/trees using C++ type information.
 *
 * The template methods can be used to find a specific C++ instance in the prototype tree,
 * or create a new sub-class if it cannot be found.
 */
class PrototypeChain final {
private:
  Prototype* _prototype;

public:
  PrototypeChain() {}
  ~PrototypeChain() {
    delete _prototype;
  }

public:
  /**
   * Gets the current `Prototype` as a whole.
   * This does not do any modifications to the Prototype tree.
   */
  inline Prototype& getPrototype() const {
    return *_prototype;
  }

public:
  /**
   * Extends the Prototype with the given type `Derived`.
   * If the Prototype already extended `Derived`, this returns the current state.
   */
  template <typename Derived>
  inline Prototype& extendPrototype() {
    if (_prototype == nullptr) {
      _prototype = Prototype::create(typeid(Derived));
    }

    return getOrExtendPrototype<Derived>(_prototype);
  }

private:
  /**
   * Perform a bottom-down search of the given `Derived` C++ type info.
   * If the current prototype tree does not have a Prototype that represents the
   * C++ type `Derived`, it will extend it at the bottom and shift the `Prototype` tree
   * up by one.
   */
  template <typename Derived>
  inline Prototype& getOrExtendPrototype(Prototype* base) {
    if (base->instanceTypeId == std::type_index(typeid(Derived))) {
      // If the Prototype represents the caller type (`Derived`), we work with this Prototype.
      return *base;
    } else {
      if (base->base != nullptr) {
        // We didn't find a match in this prototype, let's recursively try it's parent!
        return getOrExtendPrototype<Derived>(base->base);
      } else {
        // We didn't find `Derived` and we don't have a base- add a child and shift the tree by one.
        Prototype* newBase = _prototype;
        _prototype = Prototype::create(typeid(Derived));
        _prototype->base = newBase;
        return *_prototype;
      }
    }
  }
};

} // namespace margelo::nitro
