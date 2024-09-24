//
//  JVariant.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include <fbjni/fbjni.h>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

template <typename A, typename B>
class JVariant2 : public jni::JavaClass<JVariant2<A, B>> {
public:
  static constexpr auto kJavaDescriptor = "Lcom/margelo/nitro/Variant2;";
  using jni::JavaClass<JVariant2<A, B>>::self;

  class JFirst : public jni::JavaClass<JFirst, JVariant2<A, jobject>> {
  public:
    static constexpr auto kJavaDescriptor = "Lcom/margelo/nitro/Variant2$First;";
    A getValue() {
      static const auto method = JFirst::javaClassStatic()->getMethod<A()>("getValue");
      return method(this->self());
    }
  };
  class JSecond : public jni::JavaClass<JSecond, JVariant2<jobject, B>> {
  public:
    static constexpr auto kJavaDescriptor = "Lcom/margelo/nitro/Variant2$Second;";
    B getValue() {
      static const auto method = JSecond::javaClassStatic()->getMethod<B()>("getValue");
      return method(this->self());
    }
  };

  static jni::local_ref<JVariant2<A, B>> create(A value) {
    return JFirst::newInstance(value);
  }
  static jni::local_ref<JVariant2<A, B>> create(B value) {
    return JSecond::newInstance(value);
  }

  template <typename T>
  bool is() {
    if constexpr (std::is_same_v<T, A>) {
      return jni::isObjectRefType(self(), JFirst::javaClassStatic());
    } else if constexpr (std::is_same_v<T, B>) {
      return jni::isObjectRefType(self(), JSecond::javaClassStatic());
    } else {
      static_assert("Type " + std::string(typeid(T).name()) + " is not part of this variant! (" +
                    std::string(typeid(decltype(this)).name()) + ")");
    }
  }

  template <typename T>
  T get() {
    if constexpr (std::is_same_v<T, A>) {
      return jni::static_ref_cast<JFirst>(self())->getValue();
    } else if constexpr (std::is_same_v<T, B>) {
      return jni::static_ref_cast<JSecond>(self())->getValue();
    } else {
      static_assert("Type " + std::string(typeid(T).name()) + " is not part of this variant! (" +
                    std::string(typeid(decltype(this)).name()) + ")");
    }
  }
};

} // namespace margelo::nitro
