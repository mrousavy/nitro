///
/// JHybridTestViewStateUpdater.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include <react/fabric/StateWrapperImpl.h>
#include <NitroModules/NitroDefines.hpp>
#include "JHybridTestViewSpec.hpp"

namespace margelo::nitro::image::views {

using namespace facebook;

class JHybridTestViewStateUpdater: public jni::JavaClass<JHybridTestViewStateUpdater> {
public:
  static constexpr auto kJavaDescriptor = "Lcom/margelo/nitro/image/views/HybridTestViewStateUpdater;";

public:
  static void updateViewProps(jni::alias_ref<jni::JClass> /* class */,
                              jni::alias_ref<JHybridTestViewSpec::javaobject> view,
                              jni::alias_ref<react::StateWrapperImpl::javaobject> stateWrapper);

public:
  static void registerNatives() {
    javaClassStatic()->registerNatives({
      makeNativeMethod("updateViewProps", JHybridTestViewStateUpdater::updateViewProps),
    });
  }
};

} // namespace margelo::nitro::image::views
