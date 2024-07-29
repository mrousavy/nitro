//
//  JHybridObjectRegistry.hpp
//  DoubleConversion
//
//  Created by Marc Rousavy on 22.07.24.
//

#pragma once

#include <fbjni/fbjni.h>
#include "JSupplier.hpp"

namespace margelo::nitro {

  using namespace facebook;

  struct JHybridObjectRegistry: public jni::JavaClass<JHybridObjectRegistry> {
   public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/HybridObjectRegistry;";

   public:
    static void registerHybridObjectConstructor(jni::alias_ref<jni::JClass> clazz,
                                                std::string hybridObjectName,
                                                jni::alias_ref<JSupplier> constructorFn);

   public:
    static void registerNatives();
  };

} // namespace margelo::nitro
