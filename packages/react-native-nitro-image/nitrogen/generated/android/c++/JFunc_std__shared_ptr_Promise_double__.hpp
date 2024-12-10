///
/// JFunc_std__shared_ptr_Promise_double__.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include <functional>

#include <functional>
#include <NitroModules/Promise.hpp>
#include <NitroModules/JPromise.hpp>

namespace margelo::nitro::image {

  using namespace facebook;

  /**
   * C++ representation of the callback Func_std__shared_ptr_Promise_double__.
   * This is a Kotlin `() -> Promise<Double>`, backed by a `std::function<...>`.
   */
  struct JFunc_std__shared_ptr_Promise_double__ final: public jni::HybridClass<JFunc_std__shared_ptr_Promise_double__> {
  public:
    static jni::local_ref<JFunc_std__shared_ptr_Promise_double__::javaobject> fromCpp(const std::function<std::shared_ptr<Promise<double>>()>& func) {
      return JFunc_std__shared_ptr_Promise_double__::newObjectCxxArgs(func);
    }

  public:
    jni::local_ref<JPromise::javaobject> call() {
      std::shared_ptr<Promise<double>> __result = _func();
      return [&]() {
        jni::local_ref<JPromise::javaobject> __localPromise = JPromise::create();
        jni::global_ref<JPromise::javaobject> __promise = jni::make_global(__localPromise);
        __result->addOnResolvedListener([=](const double& __result) {
          __promise->cthis()->resolve(jni::JDouble::valueOf(__result));
        });
        __result->addOnRejectedListener([=](const std::exception_ptr& __error) {
          auto __jniError = jni::getJavaExceptionForCppException(__error);
          __promise->cthis()->reject(__jniError);
        });
        return __localPromise;
      }();
    }

  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Func_std__shared_ptr_Promise_double__;";
    static void registerNatives() {
      registerHybrid({makeNativeMethod("call", JFunc_std__shared_ptr_Promise_double__::call)});
    }

  private:
    explicit JFunc_std__shared_ptr_Promise_double__(const std::function<std::shared_ptr<Promise<double>>()>& func): _func(func) { }

  private:
    friend HybridBase;
    std::function<std::shared_ptr<Promise<double>>()> _func;
  };

} // namespace margelo::nitro::image
