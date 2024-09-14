///
/// JImageFormat.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include "ImageFormat.hpp"
#include <NitroModules/JSIConverter.hpp>

namespace margelo::nitro::image {

  using namespace facebook;

  /**
   * The C++ JNI bridge between the C++ enum "ImageFormat" and the the Kotlin enum "ImageFormat".
   */
  struct JImageFormat final: public jni::JavaClass<JImageFormat> {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/ImageFormat;";

  public:
    /**
     * Convert this Java/Kotlin-based enum to the C++ enum ImageFormat.
     */
    [[maybe_unused]]
    [[nodiscard]] ImageFormat toCpp() const {
      static const auto clazz = javaClassStatic();
      static const auto fieldOrdinal = clazz->getField<int>("ordinal");
      int ordinal = this->getFieldValue(fieldOrdinal);
      return static_cast<ImageFormat>(ordinal);
    }

  public:
    /**
     * Create a Java/Kotlin-based enum with the given C++ enum's value.
     */
    [[maybe_unused]]
    static jni::local_ref<JImageFormat> fromCpp(ImageFormat value) {
      static const auto clazz = javaClassStatic();
      static const auto fieldJPG = clazz->getStaticField<JImageFormat>("JPG");
      static const auto fieldPNG = clazz->getStaticField<JImageFormat>("PNG");
      
      switch (value) {
        case ImageFormat::JPG:
          return jni::make_local(clazz->getStaticFieldValue(fieldJPG));
        case ImageFormat::PNG:
          return jni::make_local(clazz->getStaticFieldValue(fieldPNG));
        default:
          std::string stringValue = std::to_string(static_cast<int>(value));
          throw std::runtime_error("Invalid enum value (" + stringValue + "!");
      }
    }
  };

} // namespace margelo::nitro::image


namespace margelo::nitro {

  using namespace margelo::nitro::image;

  // C++/JNI JImageFormat <> JS ImageFormat
  template <>
  struct JSIConverter<JImageFormat> {
    static inline jni::local_ref<JImageFormat> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      ImageFormat cppValue = JSIConverter<ImageFormat>::fromJSI(runtime, arg);
      return JImageFormat::fromCpp(cppValue);
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<JImageFormat>& arg) {
      ImageFormat cppValue = arg->toCpp();
      return JSIConverter<ImageFormat>::toJSI(runtime, cppValue);
    }
    static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      return JSIConverter<ImageFormat>::canConvert(runtime, value);
    }
  };

} // namespace margelo::nitro
