///
/// JFunc_void_Person.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include <functional>
#include <NitroModules/JSIConverter.hpp>

#include <functional>
#include "Person.hpp"
#include "JPerson.hpp"
#include <string>

namespace margelo::nitro::image {

  using namespace facebook;

  /**
   * C++ representation of the callback Func_void_Person.
   * This is a Kotlin `(p: Person) -> Unit`, backed by a `std::function<...>`.
   */
  struct JFunc_void_Person final: public jni::HybridClass<JFunc_void_Person> {
  public:
    static jni::local_ref<JFunc_void_Person::javaobject> wrap(const std::function<void(jni::global_ref<JPerson> /* p */)>& func) {
      return JFunc_void_Person::newObjectCxxArgs(func);
    }
    static jni::local_ref<JFunc_void_Person::javaobject> wrap(std::function<void(jni::global_ref<JPerson> /* p */)>&& func) {
      return JFunc_void_Person::newObjectCxxArgs(std::move(func));
    }

    static jni::local_ref<JFunc_void_Person::javaobject> fromCpp(const std::function<void(const Person& /* p */)>& func) {
      return wrap([func](const jni::global_ref<JPerson>& p) {
        func(p->toCpp());
      });
    }
    static jni::local_ref<JFunc_void_Person::javaobject> fromCpp(std::function<void(const Person& /* p */)>&& func) {
      return wrap([func = std::move(func)](const jni::global_ref<JPerson>& p) {
        func(p->toCpp());
      });
    }

  public:
    void call(jni::alias_ref<JPerson> p) {
      return _func(jni::make_global(p));
    }

  public:
    [[nodiscard]] inline const std::function<void(jni::global_ref<JPerson> /* p */)>& getFunction() const noexcept {
      return _func;
    }

    /**
     * Convert this JNI-based function to a C++ function with proper type conversion.
     */
    [[nodiscard]] std::function<void(const Person& /* p */)> toCpp() const {
      std::function<void(jni::global_ref<JPerson> /* p */)> javaFunc = _func;
      return [javaFunc](const Person& p) {
        javaFunc(jni::make_global(JPerson::fromCpp(p)));
      };
    }

  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Func_void_Person;";
    static void registerNatives() {
      registerHybrid({makeNativeMethod("call", JFunc_void_Person::call)});
    }

  private:
    explicit JFunc_void_Person(const std::function<void(jni::global_ref<JPerson> /* p */)>& func): _func(func) { }
    explicit JFunc_void_Person(std::function<void(jni::global_ref<JPerson> /* p */)>&& func): _func(std::move(func)) { }

  private:
    friend HybridBase;
    std::function<void(jni::global_ref<JPerson> /* p */)> _func;
  };

} // namespace margelo::nitro::image

namespace margelo::nitro {

  // (Args...) => T <> JFunc_void_Person
  template <>
  struct JSIConverter<JFunc_void_Person::javaobject> final {
    static inline jni::local_ref<JFunc_void_Person::javaobject> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      return JFunc_void_Person::wrap(JSIConverter<std::function<void(jni::global_ref<JPerson> /* p */)>>::fromJSI(runtime, arg));
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<JFunc_void_Person::javaobject>& arg) {
      return JSIConverter<std::function<void(jni::global_ref<JPerson> /* p */)>>::toJSI(runtime, arg->cthis()->getFunction());
    }
    static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      return JSIConverter<std::function<void(jni::global_ref<JPerson> /* p */)>>::canConvert(runtime, value);
    }
  };

} // namespace margelo::nitro
