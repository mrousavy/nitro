///
/// JFunc_std__string.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include <functional>

#include <NitroModules/Callback.hpp>
#include <string>

namespace margelo::nitro::image {

  using namespace facebook;

  /**
   * Represents the Java/Kotlin callback `() -> String`.
   * This can be passed around between C++ and Java/Kotlin.
   */
  struct JFunc_std__string: public jni::JavaClass<JFunc_std__string> {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Func_std__string;";

  public:
    /**
     * Invokes the function this `JFunc_std__string` instance holds through JNI.
     */
    std::string invoke() const {
      static const auto method = getClass()->getMethod<jni::local_ref<jni::JString>()>("invoke");
      auto __result = method(self());
      return __result->toStdString();
    }
  };

  /**
   * An implementation of Func_std__string that is backed by a C++ implementation (using `std::function<...>`)
   */
  struct JFunc_std__string_cxx final: public jni::HybridClass<JFunc_std__string_cxx, JFunc_std__string> {
  public:
    static jni::local_ref<JFunc_std__string::javaobject> fromCpp(const Callback<std::string()>& func) {
      return JFunc_std__string_cxx::newObjectCxxArgs(func);
    }

  public:
    /**
     * Invokes the C++ `std::function<...>` this `JFunc_std__string_cxx` instance holds.
     */
    jni::local_ref<jni::JString> invoke_cxx() {
      std::string __result = _func();
      return jni::make_jstring(__result);
    }

  public:
    [[nodiscard]]
    inline const Callback<std::string()>& getFunction() const {
      return _func;
    }

  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Func_std__string_cxx;";
    static void registerNatives() {
      registerHybrid({makeNativeMethod("invoke", JFunc_std__string_cxx::invoke_cxx)});
    }

  private:
    explicit JFunc_std__string_cxx(const Callback<std::string()>& func): _func(func) { }

  private:
    friend HybridBase;
    Callback<std::string()> _func;
  };

} // namespace margelo::nitro::image
