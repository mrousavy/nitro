//
// Created by Hanno Gödecke on 12.12.2024.
//

#include "JValueFromStateWrapper.h"
#include "CustomComponentDescriptor.h"
#include "HybridTestObjectSwiftKotlinSpec.hpp"

namespace margelo::nitro::image {
void JValueFromStateWrapper::registerNatives() {
  registerHybrid({makeNativeMethod("valueFromStateWrapper", JValueFromStateWrapper::valueFromStateWrapper)});
}

jni::local_ref<jni::JObject> JValueFromStateWrapper::valueFromStateWrapper(jni::alias_ref<jni::JClass>,
                                                                           jni::alias_ref<StateWrapperImpl::javaobject> stateWrapperRef) {
  StateWrapperImpl* stateWrapper = stateWrapperRef->cthis();
  const State& state = stateWrapper->getState();
  // Cast state to our specific state type
  // TODO: can this be a static pointer cast?
  const auto& customStateData = dynamic_cast<const ConcreteState<CustomStateData>&>(state);
  CustomStateData data = customStateData.getData();
  std::shared_ptr<HybridTestObjectCppSpec> nativeProp = data.nativeProp;
  if (nativeProp == nullptr) {
    return nullptr;
  }

  // TODO: convert to kotlin type?
  return nullptr;
}
} // namespace margelo::nitro::image