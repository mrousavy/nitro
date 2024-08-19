//
//  JHybridObjectRegistry.cpp
//  DoubleConversion
//
//  Created by Marc Rousavy on 22.07.24.
//

#include "JHybridObjectRegistry.hpp"
#include "HybridObjectRegistry.hpp"
#include "JNISharedPtr.hpp"

namespace margelo::nitro {

void JHybridObjectRegistry::registerHybridObjectConstructor(jni::alias_ref<jni::JClass> clazz, std::string hybridObjectName,
                                                            jni::alias_ref<JHybridObjectInitializer> constructorFn) {
  auto sharedInitializer = jni::make_global(constructorFn);
  HybridObjectRegistry::registerHybridObjectConstructor(hybridObjectName, [=]() -> std::shared_ptr<HybridObject> {
    // 1. Call the Java initializer function
    jni::local_ref<JHybridObject::javaobject> hybridObject = sharedInitializer->call();
    // 2. Make the resulting HybridObject a global (shared) reference
    jni::global_ref<JHybridObject::javaobject> globalHybridObject = jni::make_global(hybridObject);
    // 3. Create a shared_ptr from the JNI global reference
    std::shared_ptr<JHybridObject> sharedCppPart = JNISharedPtr::make_shared_from_jni<JHybridObject>(globalHybridObject);
    // 4. Up-cast to a HybridObject (kinda unsafe)
    std::shared_ptr<HybridObject> cast = std::static_pointer_cast<HybridObject>(sharedCppPart);
    return cast;
  });
}

void JHybridObjectRegistry::registerNatives() {
  javaClassStatic()->registerNatives({
      makeNativeMethod("registerHybridObjectConstructor", JHybridObjectRegistry::registerHybridObjectConstructor),
  });
}
} // namespace margelo::nitro
