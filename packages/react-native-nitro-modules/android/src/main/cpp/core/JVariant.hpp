//
//  JVariant.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include "TypeIndex.hpp"
#include <fbjni/fbjni.h>
#include <string_view>
#include <tuple>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

constexpr std::string_view getJavaDescriptor(size_t numTypes) {
  switch (numTypes) {
    case 2:
      return "Lcom/margelo/nitro/Variant2";
    case 3:
      return "Lcom/margelo/nitro/Variant3";
    case 4:
      return "Lcom/margelo/nitro/Variant4";
    case 5:
      return "Lcom/margelo/nitro/Variant5";
    case 6:
      return "Lcom/margelo/nitro/Variant6";
    case 7:
      return "Lcom/margelo/nitro/Variant7";
    case 8:
      return "Lcom/margelo/nitro/Variant8";
    case 9:
      return "Lcom/margelo/nitro/Variant9";
    default: {
      static_assert("Variant of this size is not yet implemented!");
      throw;
    }
  }
}
constexpr std::string_view getInnerClassName(size_t index) {
  switch (index) {
    case 0:
      return "First";
    case 1:
      return "Second";
    case 2:
      return "Third";
    case 3:
      return "Fourth";
    case 4:
      return "Fifth";
    case 5:
      return "Sixth";
    case 6:
      return "Seventh";
    case 7:
      return "Eighth";
    case 8:
      return "Ninth";
    default:
      static_assert("Variant inner class at this index is not supported!");
      throw;
  }
}

/**
 * Variant2, Variant3, Variant4, ...
 */
template <typename... Ts>
class JVariant : public jni::JavaClass<JVariant<Ts...>> {
public:
  using Base = jni::JavaClass<JVariant<Ts...>>;
  using Base::self;
  static constexpr size_t variantSize = sizeof...(Ts);
  static auto kJavaDescriptor = []() {
    constexpr std::string_view className = getJavaDescriptor(variantSize);
    static const std::string descriptor = std::string(className) + ";";
    return descriptor.c_str();
  }();

  /**
   * Variant2.First, Variant2.Second, Variant3.First, Variant3.Second, Variant3.Third, ...
   */
  template <size_t Index>
  struct JTypeClass : public jni::JavaClass<JTypeClass<Index>, JVariant<Ts...>> {
    static auto kJavaDescriptor = []() {
      constexpr std::string_view className = getJavaDescriptor(variantSize);
      constexpr std::string_view innerClassName = getInnerClassName(Index);
      static const std::string descriptor = std::string(className) + "$" + std::string(innerClassName) + ";";
      return descriptor.c_str();
    }();

    using T = std::tuple_element_t<Index, std::tuple<Ts...>>;
    T getValue() {
      static const auto method = JTypeClass::javaClassStatic()->getMethod<T()>("getValue");
      return method(this->self());
    }
  };

  template <typename T>
  using JClassForType = JTypeClass<type_index<T, Ts...>::value>;

  /**
   * Create VariantN.N(T)
   */
  template <typename T>
  static jni::local_ref<JVariant<Ts...>> create(T value) {
    return JClassForType<T>::newInstance(value);
  }

  /**
   * Check if VariantN is .N(T)
   */
  template <typename T>
  bool is() {
    using JavaClass = JClassForType<T>;
    return jni::isObjectRefType(self(), JavaClass::javaClassStatic());
  }

  /**
   * Get a VariantN.N's .N(T)
   */
  template <typename T>
  T get() {
    using JavaClass = JClassForType<T>;
    return jni::static_ref_cast<JavaClass>(self())->getValue();
  }
};

} // namespace margelo::nitro
