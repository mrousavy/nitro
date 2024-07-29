//
//  JHybridObjectRegistry.cpp
//  DoubleConversion
//
//  Created by Marc Rousavy on 22.07.24.
//

#include "JHybridObjectRegistry.hpp"
#include "HybridObjectRegistry.hpp"

namespace margelo::nitro {


  void JHybridObjectRegistry::registerHybridObjectConstructor(jni::alias_ref<jni::JClass> clazz,
                                                              std::string hybridObjectName,
                                                              jni::alias_ref<JSupplier> constructorFn) {
    auto sharedInitializer = jni::make_global(constructorFn);
    HybridObjectRegistry::registerHybridObjectConstructor(hybridObjectName, [=]() -> std::shared_ptr<HybridObject> {
      return nullptr;
    });
  }

  void JHybridObjectRegistry::registerNatives() {
    javaClassStatic()->registerNatives({
      makeNativeMethod("registerHybridObjectConstructor", JHybridObjectRegistry::registerHybridObjectConstructor),
    });
  }


}