//
//  PrototypeChain.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 07.08.24.
//

#pragma once

#include <jsi/jsi.h>
#include <unordered_map>
#include <string>
#include <typeindex>
#include "HybridFunction.hpp"

namespace margelo::nitro {

using NativeInstanceId = std::type_index;
struct Prototype {
  Prototype* base = nullptr;
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
    delete base;
  }
};

class PrototypeChain {
private:
  Prototype* _prototype;
  
public:
  PrototypeChain() { }
  ~PrototypeChain() {
    delete _prototype;
  }
  
public:
  inline Prototype& getPrototype() {
    return *_prototype;
  }
  
public:
  template <typename Derived>
  inline Prototype& getThisPrototype() {
    if (_prototype == nullptr) {
      _prototype = Prototype::create(typeid(Derived));
    }
    
    return getThisPrototype<Derived>(_prototype);
  }
  
private:
  template <typename Derived>
  inline Prototype& getThisPrototype(Prototype* base) {
    // If the Prototype represents the caller instance's ID (`Derived`), we work with this Prototype.
    if (base->instanceTypeId == std::type_index(typeid(Derived))) {
      return *base;
    } else {
      if (base->base != nullptr) {
        // Otherwise let's try it's child!
        return getThisPrototype<Derived>(base->base);
      } else {
        // Otherwise we need to create a new child prototype in that chain
        Prototype* newBase = _prototype;
        _prototype = Prototype::create(typeid(Derived));
        _prototype->base = newBase;
        return *_prototype;
      }
    }
  }
};

} // namespace margelo::nitro
