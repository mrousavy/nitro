///
/// JOldEnum.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include "OldEnum.hpp"

namespace margelo::nitro::image {

  using namespace facebook;

  /**
   * The C++ JNI bridge between the C++ enum "OldEnum" and the the Kotlin enum "OldEnum".
   */
  struct JOldEnum final: public jni::JavaClass<JOldEnum> {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/OldEnum;";

  public:
    /**
     * Convert this Java/Kotlin-based enum to the C++ enum OldEnum.
     */
    [[maybe_unused]]
    OldEnum toCpp() const {
      static const auto clazz = javaClassStatic();
      static const auto fieldOrdinal = clazz->getField<int>("ordinal");
      int ordinal = this->getFieldValue(fieldOrdinal);
      return static_cast<OldEnum>(ordinal);
    }

  public:
    /**
     * Create a Java/Kotlin-based enum with the given C++ enum's value.
     */
    [[maybe_unused]]
    static jni::alias_ref<JOldEnum> fromCpp(OldEnum value) {
      static const auto clazz = javaClassStatic();
      static const auto fieldFIRST = clazz->getStaticField<JOldEnum>("FIRST");
      static const auto fieldSECOND = clazz->getStaticField<JOldEnum>("SECOND");
      static const auto fieldTHIRD = clazz->getStaticField<JOldEnum>("THIRD");
      
      switch (value) {
        case OldEnum::FIRST:
          return clazz->getStaticFieldValue(fieldFIRST);
        case OldEnum::SECOND:
          return clazz->getStaticFieldValue(fieldSECOND);
        case OldEnum::THIRD:
          return clazz->getStaticFieldValue(fieldTHIRD);
        default:
          std::string stringValue = std::to_string(static_cast<int>(value));
          throw std::invalid_argument("Invalid enum value (" + stringValue + "!");
      }
    }
  };

} // namespace margelo::nitro::image
