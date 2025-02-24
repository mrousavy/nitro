///
/// JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include <functional>

#include <functional>
#include <NitroModules/Promise.hpp>
#include <NitroModules/ArrayBuffer.hpp>
#include <NitroModules/JPromise.hpp>
#include <NitroModules/JArrayBuffer.hpp>
#include <NitroModules/JUnit.hpp>

namespace margelo::nitro::image {

  using namespace facebook;

  /**
   * Represents the Java/Kotlin callback `() -> Promise<Promise<ArrayBuffer>>`.
   * This can be passed around between C++ and Java/Kotlin.
   */
  struct JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____: public jni::JavaClass<JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____> {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Func_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____;";

  public:
    /**
     * Invokes the function this `JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____` instance holds through JNI.
     */
    std::shared_ptr<Promise<std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>>> invoke() const {
      static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>()>("invoke");
      auto __result = method(self());
      return [&]() {
        auto __promise = Promise<std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>>::create();
        __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
          auto __result = jni::static_ref_cast<JPromise::javaobject>(__boxedResult);
          __promise->resolve([&]() {
            auto __promise = Promise<std::shared_ptr<ArrayBuffer>>::create();
            __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
              auto __result = jni::static_ref_cast<JArrayBuffer::javaobject>(__boxedResult);
              __promise->resolve(__result->cthis()->getArrayBuffer());
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
   * An implementation of Func_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____ that is backed by a C++ implementation (using `std::function<...>`)
   */
  struct JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer______cxx final: public jni::HybridClass<JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer______cxx, JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____> {
  public:
    static jni::local_ref<JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____::javaobject> fromCpp(const std::function<std::shared_ptr<Promise<std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>>>()>& func) {
      return JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer______cxx::newObjectCxxArgs(func);
    }

  public:
    /**
     * Invokes the C++ `std::function<...>` this `JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer______cxx` instance holds.
     */
    jni::local_ref<JPromise::javaobject> invoke_cxx() {
      std::shared_ptr<Promise<std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>>> __result = _func();
      return [&]() {
        jni::local_ref<JPromise::javaobject> __localPromise = JPromise::create();
        jni::global_ref<JPromise::javaobject> __promise = jni::make_global(__localPromise);
        __result->addOnResolvedListener([=](const std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>& __result) {
          __promise->cthis()->resolve([&]() {
            jni::local_ref<JPromise::javaobject> __localPromise = JPromise::create();
            jni::global_ref<JPromise::javaobject> __promise = jni::make_global(__localPromise);
            __result->addOnResolvedListener([=](const std::shared_ptr<ArrayBuffer>& __result) {
              __promise->cthis()->resolve(JArrayBuffer::wrap(__result));
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
    inline const std::function<std::shared_ptr<Promise<std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>>>()>& getFunction() const {
      return _func;
    }

  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Func_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer______cxx;";
    static void registerNatives() {
      registerHybrid({makeNativeMethod("invoke_cxx", JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer______cxx::invoke_cxx)});
    }

  private:
    explicit JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer______cxx(const std::function<std::shared_ptr<Promise<std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>>>()>& func): _func(func) { }

  private:
    friend HybridBase;
    std::function<std::shared_ptr<Promise<std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>>>()> _func;
  };

} // namespace margelo::nitro::image
