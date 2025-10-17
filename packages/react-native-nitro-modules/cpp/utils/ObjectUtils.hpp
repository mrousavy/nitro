//
//  ObjectUtils.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 17.10.25.
//

#pragma once

#include "BorrowingReference.hpp"
#include <jsi/jsi.h>
#include <unordered_map>

namespace margelo::nitro {

using namespace facebook;

struct PlainPropertyDescriptor {
  bool configurable;
  bool enumerable;
  jsi::Value value;
  bool writable;
};
struct ComputedReadonlyPropertyDescriptor {
  bool configurable;
  bool enumerable;
  jsi::Function get;
};
struct ComputedPropertyDescriptor {
  bool configurable;
  bool enumerable;
  jsi::Function get;
  jsi::Function set;
};

class ObjectUtils {
public:
  ObjectUtils() = delete;
  ~ObjectUtils() = delete;

public:
  /**
   * Create a new `jsi::Object` with the given `prototype`.
   * Uses a native implementation if possible.
   */
  static jsi::Object create(jsi::Runtime& runtime, const jsi::Value& prototype);

  /**
   * Define a plain property on the given `object` with the given `propertyName`.
   * The `descriptor` defines the attributes of this property.
   */
  static void defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                             PlainPropertyDescriptor&& descriptor);
  /**
   * Define a plain property on the given `object` with the given `propertyName`.
   * The `descriptor` defines the attributes of this property.
   */
  static void defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                             ComputedReadonlyPropertyDescriptor&& descriptor);
  /**
   * Define a plain property on the given `object` with the given `propertyName`.
   * The `descriptor` defines the attributes of this property.
   */
  static void defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                             ComputedPropertyDescriptor&& descriptor);

  /**
   * Freezes all values of the given `object`.
   */
  static void freeze(jsi::Runtime& runtime, const jsi::Object& object);

private:
  struct Cache {
    BorrowingReference<jsi::Function> objectCreate;
    BorrowingReference<jsi::Function> objectDefineProperty;
    BorrowingReference<jsi::Function> objectFreeze;
    // no copy
    Cache(const Cache&) = delete;
    Cache(Cache&&) = default;
    Cache() = default;
    ~Cache() = default;
  };
  static std::unordered_map<jsi::Runtime*, Cache> _cache;
};

} // namespace margelo::nitro
