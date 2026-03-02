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
 * Represents the Java `HybridObject` class.
 */
class JHybridObject : public virtual HybridObject {
public:
  // Java part for JHybridObject
  struct JavaPart: public jni::JavaClass<JHybridObject::JavaPart> {
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/HybridObject;";
  };

public:
  explicit JHybridObject(const jni::local_ref<JavaPart>& javaPart):
    _javaPart(jni::make_global(javaPart)) {}

  size_t getExternalMemorySize() noexcept override;
  bool equals(const std::shared_ptr<HybridObject>& other) override;
  void dispose() noexcept override;
  std::string toString() override;

private:
  jni::global_ref<JavaPart> _javaPart;
};

} // namespace margelo::nitro
