//
//  CommonGlobals.hpp
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

class CommonGlobals final {
public:
  CommonGlobals() = delete;
  ~CommonGlobals() = delete;

  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
   */
  class Object final {
  public:
    Object() = delete;
    ~Object() = delete;

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
  };


  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
   */
  class Promise final {
  public:
    Promise() = delete;
    ~Promise() = delete;

    jsi::Value callConstructor(jsi::Runtime& runtime, jsi::HostFunctionType&& executor);
  };

  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
   */
  class Date final {
  public:
    Date() = delete;
    ~Date() = delete;

    jsi::Value callConstructor(jsi::Runtime& runtime, double msSinceEpoch);
  };

  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
   */
  class Error final {
  public:
    Error() = delete;
    ~Error() = delete;

    bool isInstanceOf(jsi::Runtime& runtime, const jsi::Value& value);
  };

public:
  /**
   * Get a string name for a known global property name.
   */
  static const char* getKnownGlobalPropertyNameString(KnownGlobalPropertyName name);

private:
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
