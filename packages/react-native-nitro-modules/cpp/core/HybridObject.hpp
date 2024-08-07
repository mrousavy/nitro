//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

namespace margelo::nitro {
class HybridObject;
class HybridObjectPrototype;

template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "HybridObjectPrototype.hpp"
#include "IsSharedPtrTo.hpp"
#include "TypeInfo.hpp"

#include <jsi/jsi.h>
#include <memory>
#include <type_traits>

#define DO_NULL_CHECKS true

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
class HybridObject : public jsi::NativeState, public HybridObjectPrototype, public std::enable_shared_from_this<HybridObject> {
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
  virtual ~HybridObject();
  /**
   * HybridObjects cannot be copied.
   */
  HybridObject(const HybridObject& copy) = delete;
  /**
   * HybridObjects cannot be moved.
   */
  HybridObject(HybridObject&& move) = delete;

public:
  /**
   * Return the `jsi::Object` that holds this `HybridObject`. (boxed in a `jsi::Value`)
   * This properly assigns (or creates) the base prototype for this type,
   * and assigns it's NativeState.
   * Additionally, this sets the external memory pressure for proper GC memory management.
   */
  jsi::Value toObject(jsi::Runtime& runtime);

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
   * Get the size of any external (heap) allocations this `HybridObject` has made, in bytes.
   * This will be used to notify the JS GC about memory pressure.
   */
  virtual inline size_t getExternalMemorySize() noexcept {
    return 0;
  }

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
   *   registerHybridMethod("getAge", &User::getAge);
   * }
   * ```
   */
  virtual void loadHybridMethods() override;

private:
  static constexpr auto TAG = "HybridObject";
  const char* _name = TAG;
  int _instanceId = 1;
};

} // namespace margelo::nitro



namespace margelo::nitro {

using namespace facebook;

// HybridObject(NativeState) <> {}
template <typename T>
struct JSIConverter<T, std::enable_if_t<is_shared_ptr_to_v<T, jsi::NativeState>>> {
  using TPointee = typename T::element_type;

  static inline T fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
#if DO_NULL_CHECKS
    if (arg.isUndefined()) [[unlikely]] {
      throw jsi::JSError(runtime, invalidTypeErrorMessage("undefined", "It is undefined!"));
    }
    if (!arg.isObject()) [[unlikely]] {
      std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
      throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It is not an object!"));
    }
#endif
    jsi::Object object = arg.asObject(runtime);
#if DO_NULL_CHECKS
    if (!object.hasNativeState(runtime)) [[unlikely]] {
      std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
      throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It is not a NativeState!"));
    }
    if (!object.hasNativeState<TPointee>(runtime)) [[unlikely]] {
      std::string stringRepresentation = arg.toString(runtime).utf8(runtime);
      throw jsi::JSError(runtime, invalidTypeErrorMessage(stringRepresentation, "It is a different NativeState<T>!"));
    }
#endif
    return object.getNativeState<TPointee>(runtime);
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const T& arg) {
#if DO_NULL_CHECKS
    if (arg == nullptr) [[unlikely]] {
      std::string typeName = TypeInfo::getFriendlyTypename<TPointee>();
      throw jsi::JSError(runtime, "Cannot convert nullptr to NativeState<" + typeName + ">!");
    }
#endif
    if constexpr (std::is_base_of_v<HybridObject, TPointee>) {
      // It's a HybridObject - use it's internal constructor which caches jsi::Objects for proper memory management!
      return arg->toObject(runtime);
    } else {
      // It's any other kind of jsi::HostObject - just create it as normal. This will not have a prototype then!
      jsi::Object object(runtime);
      object.setNativeState(runtime, arg);
      return object;
    }
  }

  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (value.isObject()) {
      jsi::Object object = value.getObject(runtime);
      return object.hasNativeState<TPointee>(runtime);
    }
    return false;
  }

private:
  static inline std::string invalidTypeErrorMessage(const std::string& typeDescription, const std::string& reason) {
    std::string typeName = TypeInfo::getFriendlyTypename<TPointee>();
    return "Cannot convert \"" + typeDescription + "\" to NativeState<" + typeName + ">! " + reason;
  }
};

} // namespace margelo::nitro
