///
/// JFunc_void_std__optional_double_.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include <functional>

#include <functional>
#include <optional>

namespace margelo::nitro::image {

  using namespace facebook;

  /**
   * Represents the Java/Kotlin callback `(maybe: Double?) -> Unit`.
   * This can be passed around between C++ and Java/Kotlin.
   */
  struct JFunc_void_std__optional_double_: public jni::JavaClass<JFunc_void_std__optional_double_> {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Func_void_std__optional_double_;";

  public:
    /**
     * Invokes the function this `JFunc_void_std__optional_double_` instance holds through JNI.
     */
    void invoke(std::optional<double> maybe) const {
      static const auto method = getClass()->getMethod<void(jni::alias_ref<jni::JDouble> /* maybe */)>("invoke");
      method(self(), maybe.has_value() ? jni::JDouble::valueOf(maybe.value()) : nullptr);
    }
  };

  /**
   * An implementation of Func_void_std__optional_double_ that is backed by a C++ implementation (using `std::function<...>`)
   */
  struct JFunc_void_std__optional_double__cxx final: public jni::HybridClass<JFunc_void_std__optional_double__cxx, JFunc_void_std__optional_double_> {
  public:
    static jni::local_ref<JFunc_void_std__optional_double_::javaobject> fromCpp(const std::function<void(std::optional<double> /* maybe */)>& func) {
      return JFunc_void_std__optional_double__cxx::newObjectCxxArgs(func);
    }

  public:
    /**
     * Invokes the C++ `std::function<...>` this `JFunc_void_std__optional_double__cxx` instance holds.
     */
    void invoke_cxx(jni::alias_ref<jni::JDouble> maybe) {
      _func(maybe != nullptr ? std::make_optional(maybe->value()) : std::nullopt);
    }

  public:
    [[nodiscard]]
    inline const std::function<void(std::optional<double> /* maybe */)>& getFunction() const {
      return _func;
    }

  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Func_void_std__optional_double__cxx;";
    static void registerNatives() {
      registerHybrid({makeNativeMethod("invoke", JFunc_void_std__optional_double__cxx::invoke_cxx)});
    }

  private:
    explicit JFunc_void_std__optional_double__cxx(const std::function<void(std::optional<double> /* maybe */)>& func): _func(func) { }

  private:
    friend HybridBase;
    std::function<void(std::optional<double> /* maybe */)> _func;
  };

} // namespace margelo::nitro::image
