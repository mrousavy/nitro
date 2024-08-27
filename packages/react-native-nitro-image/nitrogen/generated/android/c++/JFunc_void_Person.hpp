///
/// JFunc_void_Person.hpp
/// Tue Aug 27 2024
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include <functional>

namespace margelo::nitro::image {

  using namespace facebook;

  /**
   * C++ representation of the callback Func_void_Person.
   * This is a Kotlin `(p: struct) => void`, backed by a `std::function<...>`.
   */
  struct JFunc_void_Person final: public jni::HybridClass<JFunc_void_Person> {
  public:
    static jni::local_ref<JFunc_void_Person::javaobject> fromCpp(const std::function<void(const Person& /* p */)>& func) {
      return JFunc_void_Person::newObjectCxxArgs(func);
    }

  public:
    void call(Person&& p) {
      return _func(std::forward<decltype(p)>(p));
    }

  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Func_void_Person;";
    static void registerNatives() {
      registerHybrid({makeNativeMethod("call", JFunc_void_Person::call)});
    }

  private:
    explicit JFunc_void_Person(const std::function<void(const Person& /* p */)>& func): _func(func) { }

  private:
    friend HybridBase;
    std::function<void(const Person& /* p */)> _func;
  };

} // namespace margelo::nitro::image
