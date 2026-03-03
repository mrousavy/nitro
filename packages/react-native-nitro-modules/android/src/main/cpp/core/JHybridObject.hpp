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
 * - JavaPart: The actual Java Class (HybridObject)
 * - CxxPart: The nested Java CxxPart (HybridObject.CxxPart) - this builds the proper inheritance chain
 */
class JHybridObject : public virtual HybridObject {
 public:
  struct JavaPart: jni::JavaClass<JavaPart> {
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/HybridObject;";
  };
  struct CxxPart: jni::HybridClass<CxxPart> {
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/HybridObject$CxxPart;";
    static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis);
    static void registerNatives();
    explicit CxxPart(jni::alias_ref<jhybridobject> jThis) : _javaPart(jni::make_global(jThis)) {}
    virtual ~CxxPart();
   private:
    jni::global_ref<CxxPart::jhybridobject> _javaPart;
  };

public:
  explicit JHybridObject(jni::alias_ref<JavaPart> javaPart);
  ~JHybridObject() override;

 public:
  void dispose() noexcept override;
  bool equals(const std::shared_ptr<HybridObject> &other) override;
  size_t getExternalMemorySize() noexcept override;
  std::string toString() override;

private:
  jni::global_ref<JavaPart> _javaPart;
};

} // namespace margelo::nitro
