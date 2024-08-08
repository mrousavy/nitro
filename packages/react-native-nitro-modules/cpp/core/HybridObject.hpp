//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

#include "HybridObjectPrototype.hpp"

#include <jsi/jsi.h>
#include <memory>
#include <type_traits>

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
   * Get the `std::shared_ptr` instance of this HybridObject.
   * The HybridObject must be managed inside a `shared_ptr` already, otherwise this will fail.
   */
  template <typename Derived>
  std::shared_ptr<Derived> shared() {
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
  std::unordered_map<jsi::Runtime*, OwningReference<jsi::WeakObject>> _objectCache;
};

} // namespace margelo::nitro
