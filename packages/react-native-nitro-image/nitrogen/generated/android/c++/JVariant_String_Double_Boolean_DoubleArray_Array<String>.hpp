///
/// JVariant_String_Double_Boolean_DoubleArray_Array<String>.hpp
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
   * The C++ JNI bridge between the C++ std::variant and the Java class "Variant_String_Double_Boolean_DoubleArray_Array<String>".
   */
  class JVariant_String_Double_Boolean_DoubleArray_Array<String>: public jni::JavaClass<JVariant_String_Double_Boolean_DoubleArray_Array<String>> {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Variant_String_Double_Boolean_DoubleArray_Array<String>;";

    static jni::local_ref<JVariant_String_Double_Boolean_DoubleArray_Array<String>> create_0(jni::alias_ref<jni::JString> value) {
      static const auto method = javaClassStatic()->getStaticMethod<JVariant_String_Double_Boolean_DoubleArray_Array<String>(jni::alias_ref<jni::JString>)>("create");
      return method(javaClassStatic(), value);
    }
    static jni::local_ref<JVariant_String_Double_Boolean_DoubleArray_Array<String>> create_1(double value) {
      static const auto method = javaClassStatic()->getStaticMethod<JVariant_String_Double_Boolean_DoubleArray_Array<String>(double)>("create");
      return method(javaClassStatic(), value);
    }
    static jni::local_ref<JVariant_String_Double_Boolean_DoubleArray_Array<String>> create_2(jboolean value) {
      static const auto method = javaClassStatic()->getStaticMethod<JVariant_String_Double_Boolean_DoubleArray_Array<String>(jboolean)>("create");
      return method(javaClassStatic(), value);
    }
    static jni::local_ref<JVariant_String_Double_Boolean_DoubleArray_Array<String>> create_3(jni::alias_ref<jni::JArrayDouble> value) {
      static const auto method = javaClassStatic()->getStaticMethod<JVariant_String_Double_Boolean_DoubleArray_Array<String>(jni::alias_ref<jni::JArrayDouble>)>("create");
      return method(javaClassStatic(), value);
    }
    static jni::local_ref<JVariant_String_Double_Boolean_DoubleArray_Array<String>> create_4(jni::alias_ref<jni::JArrayClass<jni::JString>> value) {
      static const auto method = javaClassStatic()->getStaticMethod<JVariant_String_Double_Boolean_DoubleArray_Array<String>(jni::alias_ref<jni::JArrayClass<jni::JString>>)>("create");
      return method(javaClassStatic(), value);
    }

    static jni::local_ref<JVariant_String_Double_Boolean_DoubleArray_Array<String>> fromCpp(const std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>>& variant) {
      switch (variant.index()) {
        case 0: return create_0(jni::make_jstring(std::get<0>(variant)));
        case 1: return create_1(std::get<1>(variant));
        case 2: return create_2(std::get<2>(variant));
        case 3: return create_3([&]() {
          size_t __size = std::get<3>(variant).size();
          jni::local_ref<jni::JArrayDouble> __array = jni::JArrayDouble::newArray(__size);
          __array->setRegion(0, __size, std::get<3>(variant).data());
          return __array;
        }());
        case 4: return create_4([&]() {
          size_t __size = std::get<4>(variant).size();
          jni::local_ref<jni::JArrayClass<jni::JString>> __array = jni::JArrayClass<jni::JString>::newArray(__size);
          for (size_t __i = 0; __i < __size; __i++) {
            const auto& __element = std::get<4>(variant)[__i];
            __array->setElement(__i, *jni::make_jstring(__element));
          }
          return __array;
        }());
        default: throw std::invalid_argument("Variant holds unknown index! (" + std::to_string(variant.index()) + ")");
      }
    }

    [[nodiscard]] std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>> toCpp() const;
  };

  namespace JVariant_String_Double_Boolean_DoubleArray_Array<String>_impl {
    class First: public jni::JavaClass<First, JVariant_String_Double_Boolean_DoubleArray_Array<String>> {
    public:
      static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Variant_String_Double_Boolean_DoubleArray_Array<String>$First;";
    
      [[nodiscard]] jni::local_ref<jni::JString> getValue() const {
        static const auto field = javaClassStatic()->getField<jni::JString>("value");
        return getFieldValue(field);
      }
    };
    
    class Second: public jni::JavaClass<Second, JVariant_String_Double_Boolean_DoubleArray_Array<String>> {
    public:
      static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Variant_String_Double_Boolean_DoubleArray_Array<String>$Second;";
    
      [[nodiscard]] double getValue() const {
        static const auto field = javaClassStatic()->getField<double>("value");
        return getFieldValue(field);
      }
    };
    
    class Third: public jni::JavaClass<Third, JVariant_String_Double_Boolean_DoubleArray_Array<String>> {
    public:
      static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Variant_String_Double_Boolean_DoubleArray_Array<String>$Third;";
    
      [[nodiscard]] jboolean getValue() const {
        static const auto field = javaClassStatic()->getField<jboolean>("value");
        return getFieldValue(field);
      }
    };
    
    class Fourth: public jni::JavaClass<Fourth, JVariant_String_Double_Boolean_DoubleArray_Array<String>> {
    public:
      static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Variant_String_Double_Boolean_DoubleArray_Array<String>$Fourth;";
    
      [[nodiscard]] jni::local_ref<jni::JArrayDouble> getValue() const {
        static const auto field = javaClassStatic()->getField<jni::JArrayDouble>("value");
        return getFieldValue(field);
      }
    };
    
    class Fifth: public jni::JavaClass<Fifth, JVariant_String_Double_Boolean_DoubleArray_Array<String>> {
    public:
      static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/Variant_String_Double_Boolean_DoubleArray_Array<String>$Fifth;";
    
      [[nodiscard]] jni::local_ref<jni::JArrayClass<jni::JString>> getValue() const {
        static const auto field = javaClassStatic()->getField<jni::JArrayClass<jni::JString>>("value");
        return getFieldValue(field);
      }
    };
  } // namespace JVariant_String_Double_Boolean_DoubleArray_Array<String>_impl

  std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>> JVariant_String_Double_Boolean_DoubleArray_Array<String>::toCpp() const {
    if (isInstanceOf(JVariant_String_Double_Boolean_DoubleArray_Array<String>_impl::First::javaClassStatic())) {
      auto jniValue = static_cast<const JVariant_String_Double_Boolean_DoubleArray_Array<String>_impl::First*>(this)->getValue();
      return jniValue->toStdString();
    } else if (isInstanceOf(JVariant_String_Double_Boolean_DoubleArray_Array<String>_impl::Second::javaClassStatic())) {
      auto jniValue = static_cast<const JVariant_String_Double_Boolean_DoubleArray_Array<String>_impl::Second*>(this)->getValue();
      return jniValue;
    } else if (isInstanceOf(JVariant_String_Double_Boolean_DoubleArray_Array<String>_impl::Third::javaClassStatic())) {
      auto jniValue = static_cast<const JVariant_String_Double_Boolean_DoubleArray_Array<String>_impl::Third*>(this)->getValue();
      return static_cast<bool>(jniValue);
    } else if (isInstanceOf(JVariant_String_Double_Boolean_DoubleArray_Array<String>_impl::Fourth::javaClassStatic())) {
      auto jniValue = static_cast<const JVariant_String_Double_Boolean_DoubleArray_Array<String>_impl::Fourth*>(this)->getValue();
      return [&]() {
      size_t __size = jniValue->size();
      std::vector<double> __vector(__size);
      jniValue->getRegion(0, __size, __vector.data());
      return __vector;
    }();
    } else if (isInstanceOf(JVariant_String_Double_Boolean_DoubleArray_Array<String>_impl::Fifth::javaClassStatic())) {
      auto jniValue = static_cast<const JVariant_String_Double_Boolean_DoubleArray_Array<String>_impl::Fifth*>(this)->getValue();
      return [&]() {
      size_t __size = jniValue->size();
      std::vector<std::string> __vector;
      __vector.reserve(__size);
      for (size_t __i = 0; __i < __size; __i++) {
        auto __element = jniValue->getElement(__i);
        __vector.push_back(__element->toStdString());
      }
      return __vector;
    }();
    }
    throw std::invalid_argument("Variant is unknown Kotlin instance!");
  }

} // namespace margelo::nitro::image
