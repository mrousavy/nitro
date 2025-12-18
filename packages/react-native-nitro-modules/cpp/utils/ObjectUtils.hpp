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

enum class KnownGlobalPropertyName { DISPATCHER, JSI_CACHE, NITRO_MODULES_PROXY };

class ObjectUtils {
public:
  ObjectUtils() = delete;
  ~ObjectUtils() = delete;

public:
  /**
   * Create a new `jsi::Object` with the given `prototype`.
   * Uses a native implementation if possible.
   */
  static jsi::Object create(jsi::Runtime& runtime, const jsi::Value& prototype, bool allowCache = true);

  /**
   * Define a global value for the given Runtime.
   * In debug, this performs additional safety checks such as freezing the property.
   */
  static void defineGlobal(jsi::Runtime& runtime, KnownGlobalPropertyName name, jsi::Value&& value, bool allowCache = true);

  /**
   * Define a plain property on the given `object` with the given `propertyName`.
   * The `descriptor` defines the attributes of this property.
   */
  static void defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                             PlainPropertyDescriptor&& descriptor, bool allowCache = true);
  /**
   * Define a plain property on the given `object` with the given `propertyName`.
   * The `descriptor` defines the attributes of this property.
   */
  static void defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                             ComputedReadonlyPropertyDescriptor&& descriptor, bool allowCache = true);
  /**
   * Define a plain property on the given `object` with the given `propertyName`.
   * The `descriptor` defines the attributes of this property.
   */
  static void defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                             ComputedPropertyDescriptor&& descriptor, bool allowCache = true);

  /**
   * Freezes all values of the given `object`.
   */
  static void freeze(jsi::Runtime& runtime, const jsi::Object& object, bool allowCache = true);

  /**
   * Get a string name for a known global property name.
   */
  static const char* getKnownGlobalPropertyNameString(KnownGlobalPropertyName name);

  /**
   * Get a global Function, and optionally cache it in the Runtime via the `key`.
   */
  static BorrowingReference<jsi::Function> getGlobalFunction(jsi::Runtime& runtime, const char* key,
                                                             std::function<jsi::Function(jsi::Runtime&)> getFunction,
                                                             bool allowCache = true);

private:
  using FunctionCache = std::unordered_map<std::string, BorrowingReference<jsi::Function>>;
  static std::unordered_map<jsi::Runtime*, FunctionCache> _cache;
};

} // namespace margelo::nitro
