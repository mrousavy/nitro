///
/// JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_double____.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
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
   * Represents the Java/Kotlin callback `() -> Promise<Promise<Double>>`.
   * This can be passed around between C++ and Java/Kotlin.
   */
  struct JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_double____: public jni::JavaClass<JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_double____> {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Func_std__shared_ptr_Promise_std__shared_ptr_Promise_double____;";

  public:
    /**
     * Invokes the function this `JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_double____` instance holds through JNI.
     */
    std::shared_ptr<Promise<std::shared_ptr<Promise<double>>>> invoke() const {
      static const auto method = getClass()->getMethod<jni::local_ref<JPromise::javaobject>()>("invoke");
      auto __result = method(self());
      return [&]() {
        auto __promise = Promise<std::shared_ptr<Promise<double>>>::create();
        __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
          auto __result = jni::static_ref_cast<JPromise::javaobject>(__boxedResult);
          __promise->resolve([&]() {
            auto __promise = Promise<double>::create();
            __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
              auto __result = jni::static_ref_cast<jni::JDouble>(__boxedResult);
              __promise->resolve(__result->value());
            });
            __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
              jni::JniException __jniError(__throwable);
              __promise->reject(std::make_exception_ptr(__jniError));
            });
            return __promise;
          }());
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
   * An implementation of Func_std__shared_ptr_Promise_std__shared_ptr_Promise_double____ that is backed by a C++ implementation (using `std::function<...>`)
   */
  struct JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_double_____cxx final: public jni::HybridClass<JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_double_____cxx, JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_double____> {
  public:
    static jni::local_ref<JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_double____::javaobject> fromCpp(const std::function<std::shared_ptr<Promise<std::shared_ptr<Promise<double>>>>()>& func) {
      return JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_double_____cxx::newObjectCxxArgs(func);
    }

  public:
    /**
     * Invokes the C++ `std::function<...>` this `JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_double_____cxx` instance holds.
     */
    jni::local_ref<JPromise::javaobject> invoke_cxx() {
      std::shared_ptr<Promise<std::shared_ptr<Promise<double>>>> __result = _func();
      return [&]() {
        jni::local_ref<JPromise::javaobject> __localPromise = JPromise::create();
        jni::global_ref<JPromise::javaobject> __promise = jni::make_global(__localPromise);
        __result->addOnResolvedListener([=](const std::shared_ptr<Promise<double>>& __result) {
          __promise->cthis()->resolve([&]() {
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
          }());
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
    inline const std::function<std::shared_ptr<Promise<std::shared_ptr<Promise<double>>>>()>& getFunction() const {
      return _func;
    }

  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Func_std__shared_ptr_Promise_std__shared_ptr_Promise_double_____cxx;";
    static void registerNatives() {
      registerHybrid({makeNativeMethod("invoke_cxx", JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_double_____cxx::invoke_cxx)});
    }

  private:
    explicit JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_double_____cxx(const std::function<std::shared_ptr<Promise<std::shared_ptr<Promise<double>>>>()>& func): _func(func) { }

  private:
    friend HybridBase;
    std::function<std::shared_ptr<Promise<std::shared_ptr<Promise<double>>>>()> _func;
  };

} // namespace margelo::nitro::image
