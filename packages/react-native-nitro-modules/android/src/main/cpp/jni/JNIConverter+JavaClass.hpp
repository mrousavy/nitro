//
// Created by Marc Rousavy on 21.12.25.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JNIConverter;
} // namespace margelo::nitro

#include "JNIConverter.hpp"
#include "NitroTypeInfo.hpp"
#include <fbjni/fbjni.h>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

template <typename T, typename R>
concept IsJavaRef =
    std::same_as<T, R> || std::same_as<T, jni::alias_ref<R>> || std::same_as<T, jni::local_ref<R>> || std::same_as<T, jni::global_ref<R>>;

template <class T, class U>
concept FromCppConvertible = requires(U&& u) {
  { T::fromCpp(std::forward<U>(u)) } -> IsJavaRef<T>;
};
template <class T, class U>
concept ToCppConvertible = requires(T t) {
  { t.toCpp() } -> std::same_as<U>;
};

// T <> jni::JavaClass<...>
template <class CppClass>
struct JNIConverter<CppClass> final {
  template <typename JavaClass>
    requires ToCppConvertible<JavaClass, CppClass>
  static inline CppClass fromJNI(jni::alias_ref<JavaClass> arg) {
    if (arg == nullptr) [[unlikely]] {
      throw std::runtime_error(std::string("Cannot convert `") + TypeInfo::getFriendlyTypename<JavaClass>(true) + "` to `" +
                               TypeInfo::getFriendlyTypename<CppClass>(true) + "` - it is null!");
    }
    return arg->toCpp();
  }

  template <typename JavaClass>
    requires FromCppConvertible<JavaClass, CppClass>
  static inline jni::alias_ref<JavaClass> toJNI(CppClass arg) {
    return JavaClass::fromCpp(arg);
  }

  template <typename JavaClass>
    requires ToCppConvertible<JavaClass, CppClass>
  static inline bool canConvert(jni::alias_ref<JavaClass> arg) {
    return arg != nullptr;
  }
};

} // namespace margelo::nitro
