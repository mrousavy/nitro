//
//  JUnit.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 19.11.24.
//

#pragma once

#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents a `Unit` from Kotlin.
 * This is similar to `void` for Java, but is actually an `Object`.
 */
class JUnit final : public jni::HybridClass<JAnyMap> {
public:
  static auto constexpr kJavaDescriptor = "Lkotlin/Unit;";

  static jni::alias_ref<JUnit::javaobject> instance() {
      static const auto clazz = JUnit::javaClassStatic();
      static const auto field = clazz->getStaticField<JUnit::javaobject>("INSTANCE");
      static const auto sharedInstance = clazz->getStaticFieldValue(field);
      return sharedInstance;
  }
};

} // namespace margelo::nitro
