///
/// JFunc_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec___.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include <functional>

#include <functional>
#include <NitroModules/Promise.hpp>
#include <memory>
#include "HybridChildSpec.hpp"
#include <NitroModules/JPromise.hpp>
#include "JHybridChildSpec.hpp"
#include <NitroModules/JNISharedPtr.hpp>

namespace margelo::nitro::image {

  using namespace facebook;

  /**
   * Represents the Java/Kotlin callback `() -> Promise<HybridChildSpec>`.
   * This can be passed around between C++ and Java/Kotlin.
   */
  struct JFunc_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec___: public jni::JavaClass<JFunc_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec___> {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Func_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec___;";

  public:
    /**
     * Invokes the function this `JFunc_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec___` instance holds through JNI.
     */
    std::shared_ptr<Promise<std::shared_ptr<margelo::nitro::image::HybridChildSpec>>> invoke() const {
      static const auto method = getClass()->getMethod<jni::local_ref<JPromise::javaobject>()>("invoke");
      auto __result = method(self());
      return [&]() {
        auto __promise = Promise<std::shared_ptr<margelo::nitro::image::HybridChildSpec>>::create();
        __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
          auto __result = jni::static_ref_cast<JHybridChildSpec::javaobject>(__boxedResult);
          __promise->resolve(JNISharedPtr::make_shared_from_jni<JHybridChildSpec>(jni::make_global(__result)));
        });
        __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
          jni::JniException __jniError(__throwable);
          __promise->reject(std::make_exception_ptr(__jniError));
        });
        return __promise;
      }();
    }
  };

  /**
   * An implementation of Func_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec___ that is backed by a C++ implementation (using `std::function<...>`)
   */
  struct JFunc_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec____cxx final: public jni::HybridClass<JFunc_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec____cxx, JFunc_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec___> {
  public:
    static jni::local_ref<JFunc_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec___::javaobject> fromCpp(const std::function<std::shared_ptr<Promise<std::shared_ptr<margelo::nitro::image::HybridChildSpec>>>()>& func) {
      return JFunc_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec____cxx::newObjectCxxArgs(func);
    }

  public:
    /**
     * Invokes the C++ `std::function<...>` this `JFunc_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec____cxx` instance holds.
     */
    jni::local_ref<JPromise::javaobject> invoke_cxx() {
      std::shared_ptr<Promise<std::shared_ptr<margelo::nitro::image::HybridChildSpec>>> __result = _func();
      return [&]() {
        jni::local_ref<JPromise::javaobject> __localPromise = JPromise::create();
        jni::global_ref<JPromise::javaobject> __promise = jni::make_global(__localPromise);
        __result->addOnResolvedListener([=](const std::shared_ptr<margelo::nitro::image::HybridChildSpec>& __result) {
          __promise->cthis()->resolve(std::dynamic_pointer_cast<JHybridChildSpec>(__result)->getJavaPart());
        });
        __result->addOnRejectedListener([=](const std::exception_ptr& __error) {
          auto __jniError = jni::getJavaExceptionForCppException(__error);
          __promise->cthis()->reject(__jniError);
        });
        return __localPromise;
      }();
    }

  public:
    [[nodiscard]]
    inline const std::function<std::shared_ptr<Promise<std::shared_ptr<margelo::nitro::image::HybridChildSpec>>>()>& getFunction() const {
      return _func;
    }

  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Func_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec____cxx;";
    static void registerNatives() {
      registerHybrid({makeNativeMethod("invoke", JFunc_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec____cxx::invoke_cxx)});
    }

  private:
    explicit JFunc_std__shared_ptr_Promise_std__shared_ptr_margelo__nitro__image__HybridChildSpec____cxx(const std::function<std::shared_ptr<Promise<std::shared_ptr<margelo::nitro::image::HybridChildSpec>>>()>& func): _func(func) { }

  private:
    friend HybridBase;
    std::function<std::shared_ptr<Promise<std::shared_ptr<margelo::nitro::image::HybridChildSpec>>>()> _func;
  };

} // namespace margelo::nitro::image
