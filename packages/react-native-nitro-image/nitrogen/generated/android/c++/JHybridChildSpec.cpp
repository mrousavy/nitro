///
/// JHybridChildSpec.cpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#include "JHybridChildSpec.hpp"





namespace margelo::nitro::image {

  jni::local_ref<JHybridChildSpec::jhybriddata> JHybridChildSpec::initHybrid(jni::alias_ref<jhybridobject> jThis) {
    return makeCxxInstance(jThis);
  }

  void JHybridChildSpec::registerNatives() {
    registerHybrid({
      makeNativeMethod("initHybrid", JHybridChildSpec::initHybrid),
    });
  }

  size_t JHybridChildSpec::getExternalMemorySize() noexcept {
    static const auto method = javaClassStatic()->getMethod<jlong()>("getMemorySize");
    return method(_javaPart);
  }

  // Properties
  double JHybridChildSpec::getChildValue() {
    static const auto method = javaClassStatic()->getMethod<double()>("getChildValue");
    auto __result = method(_javaPart);
    return __result;
  }
  double JHybridChildSpec::getBaseValue() {
    static const auto method = javaClassStatic()->getMethod<double()>("getBaseValue");
    auto __result = method(_javaPart);
    return __result;
  }

  // Methods


} // namespace margelo::nitro::image
