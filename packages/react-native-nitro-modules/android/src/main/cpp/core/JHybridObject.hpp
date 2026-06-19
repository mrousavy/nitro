//
//  JHybridObject.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include "HybridObject.hpp"
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents the Java `HybridObject` instance.
 * HybridData is passed up from inherited members, so this acts like a base class
 * and has to be inherited as "virtual" in C++ to properly avoid creating multiple `HybridObject` instances.
 */
class JHybridObject : public jni::HybridClass<JHybridObject>, public virtual HybridObject {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/HybridObject;";

public:
  // C++ constructor (called from Java via `initHybrid()`)
  explicit JHybridObject(jni::alias_ref<jhybridobject> jThis) : _javaPart(jni::make_global(jThis)) {}
  // C++ default constructor used by older Nitro versions (deprecated in favor of the jThis one)
  [[deprecated]] JHybridObject() = default;

public:
  ~JHybridObject() override;

public:
  // `shared()` has custom logic because we ref-count using `jni::global_ref`!
  std::shared_ptr<HybridObject> shared() override;

private:
  jni::global_ref<JHybridObject::javaobject> _javaPart;
  friend HybridBase;
};

} // namespace margelo::nitro
