//
//  JSupplier.hpp
//  DoubleConversion
//
//  Created by Marc Rousavy on 22.07.24.
//

#pragma once

#include <fbjni/fbjni.h>
#include "HybridObject.hpp"

namespace margelo::nitro {

  using namespace facebook;

 class JHybridObject: public jni::HybridClass<JHybridObject>, HybridObject {
  public:
   static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/HybridObject;";
 };

  struct JSupplier: public jni::JavaClass<JSupplier> {
  public:
    jni::alias_ref<JHybridObject::javaobject> call() const {
      const auto method = this->getClass()->getMethod<jni::alias_ref<JHybridObject::javaobject>()>("initialize");
      return method(self());
    }

  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/HybridObjectInitializer;";
  };

} // namespace margelo::nitro
