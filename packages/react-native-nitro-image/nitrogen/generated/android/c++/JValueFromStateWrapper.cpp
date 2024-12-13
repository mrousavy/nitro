//
// Created by Hanno Gödecke on 12.12.2024.
//

#include "JValueFromStateWrapper.h"
#include "CustomComponentDescriptor.h"
#include "HybridTestObjectSwiftKotlinSpec.hpp"
#include "JHybridTestObjectSwiftKotlinSpec.hpp"

namespace margelo::nitro::image {
void JValueFromStateWrapper::registerNatives() {
  registerHybrid({makeNativeMethod("valueFromStateWrapper", JValueFromStateWrapper::valueFromStateWrapper)});
}

jni::local_ref<JHybridTestObjectSwiftKotlinSpec::javaobject> JValueFromStateWrapper::valueFromStateWrapper(jni::alias_ref<jni::JClass>,
                                                                           jni::alias_ref<StateWrapperImpl::javaobject> stateWrapperRef) {
  StateWrapperImpl* stateWrapper = stateWrapperRef->cthis();
  const State& state = stateWrapper->getState();
  // Cast state to our specific state type
  // TODO: can this be a static pointer cast?
  const auto& customStateData = dynamic_cast<const ConcreteState<CustomStateData>&>(state);
  CustomStateData data = customStateData.getData();
  std::shared_ptr<HybridTestObjectSwiftKotlinSpec> nativeProp = data.nativeProp;
  if (nativeProp == nullptr) {
    return nullptr;
  }

  // TODO: convert to kotlin type?
  std::shared_ptr<JHybridTestObjectSwiftKotlinSpec> jSpec = std::dynamic_pointer_cast<JHybridTestObjectSwiftKotlinSpec>(data.nativeProp);
  const jni::global_ref<JHybridTestObjectSwiftKotlinSpec::javaobject>& javaObject = jSpec->getJavaPart();
  const jni::local_ref<JHybridTestObjectSwiftKotlinSpec::javaobject>& localRef = jni::make_local(javaObject);
  return localRef;
}
} // namespace margelo::nitro::image