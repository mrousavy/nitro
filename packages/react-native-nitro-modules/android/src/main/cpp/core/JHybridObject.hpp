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

  explicit JHybridObject(const jni::alias_ref<JHybridObject::javaobject>& javaPart) : _javaPart(jni::make_global(javaPart)) {}

  ~JHybridObject() override = default;

public:
  inline const jni::global_ref<JHybridObject::javaobject>& getJavaPart() const noexcept {
    return _javaPart;
  }

private:
  friend HybridBase;
  jni::global_ref<JHybridObject::javaobject> _javaPart;
};

} // namespace margelo::nitro
