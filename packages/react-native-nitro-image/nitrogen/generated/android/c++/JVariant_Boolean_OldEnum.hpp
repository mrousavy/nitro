///
/// JVariant_Boolean_OldEnum.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include <variant>

namespace margelo::nitro::image {

  using namespace facebook;

  /**
   * The C++ JNI bridge between the C++ std::variant and the Java class "Variant_Boolean_OldEnum".
   */
  class JVariant_Boolean_OldEnum: public jni::JavaClass<JVariant_Boolean_OldEnum> {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Variant_Boolean_OldEnum;";

    static jni::local_ref<JVariant_Boolean_OldEnum> create_0(jboolean value) {
      static const auto method = javaClassStatic()->getStaticMethod<JVariant_Boolean_OldEnum(jboolean)>("create");
      return method(javaClassStatic(), value);
    }
    static jni::local_ref<JVariant_Boolean_OldEnum> create_1(jni::alias_ref<JOldEnum> value) {
      static const auto method = javaClassStatic()->getStaticMethod<JVariant_Boolean_OldEnum(jni::alias_ref<JOldEnum>)>("create");
      return method(javaClassStatic(), value);
    }

    static jni::local_ref<JVariant_Boolean_OldEnum> fromCpp(const std::variant<bool, OldEnum>& variant) {
      switch (variant.index()) {
        case 0: return create_0(std::get<0>(variant));
        case 1: return create_1(JOldEnum::fromCpp(std::get<1>(variant)));
        default: throw std::invalid_argument("Variant holds unknown index! (" + std::to_string(variant.index()) + ")");
      }
    }

    [[nodiscard]] std::variant<bool, OldEnum> toCpp() const;
  };

  namespace JVariant_Boolean_OldEnum_impl {
    class First: public jni::JavaClass<First, JVariant_Boolean_OldEnum> {
    public:
      static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Variant_Boolean_OldEnum$First;";
    
      [[nodiscard]] jboolean getValue() const {
        static const auto field = javaClassStatic()->getField<jboolean>("value");
        return getFieldValue(field);
      }
    };
    
    class Second: public jni::JavaClass<Second, JVariant_Boolean_OldEnum> {
    public:
      static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Variant_Boolean_OldEnum$Second;";
    
      [[nodiscard]] jni::local_ref<JOldEnum> getValue() const {
        static const auto field = javaClassStatic()->getField<JOldEnum>("value");
        return getFieldValue(field);
      }
    };
  } // namespace JVariant_Boolean_OldEnum_impl

  std::variant<bool, OldEnum> JVariant_Boolean_OldEnum::toCpp() const {
    if (isInstanceOf(JVariant_Boolean_OldEnum_impl::First::javaClassStatic())) {
      auto jniValue = static_cast<const JVariant_Boolean_OldEnum_impl::First*>(this)->getValue();
      return static_cast<bool>(jniValue);
    } else if (isInstanceOf(JVariant_Boolean_OldEnum_impl::Second::javaClassStatic())) {
      auto jniValue = static_cast<const JVariant_Boolean_OldEnum_impl::Second*>(this)->getValue();
      return jniValue->toCpp();
    }
    throw std::invalid_argument("Variant is unknown Kotlin instance!");
  }

} // namespace margelo::nitro::image
