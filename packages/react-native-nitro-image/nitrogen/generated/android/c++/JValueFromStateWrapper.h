//
// Created by Hanno Gödecke on 12.12.2024.
//
#pragma once

#include <fbjni/fbjni.h>
#include <react/fabric/StateWrapperImpl.h>

namespace margelo::nitro::image {

using namespace facebook;
using namespace facebook::react;

struct JValueFromStateWrapper : jni::HybridClass<JValueFromStateWrapper> {
  static constexpr auto kJavaDescriptor = "Lcom/margelo/nitro/image/ValueFromStateWrapper;";

  static void registerNatives();

  static jni::local_ref<jni::JObject> valueFromStateWrapper(jni::alias_ref<jni::JClass>,
                                                            jni::alias_ref<StateWrapperImpl::javaobject> stateWrapperRef);
};

} // namespace margelo::nitro::image
