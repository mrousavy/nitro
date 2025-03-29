///
/// JMapWrapper.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include "MapWrapper.hpp"

#include <string>
#include <unordered_map>

namespace margelo::nitro::image {

  using namespace facebook;

  /**
   * The C++ JNI bridge between the C++ struct "MapWrapper" and the the Kotlin data class "MapWrapper".
   */
  struct JMapWrapper final: public jni::JavaClass<JMapWrapper> {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/MapWrapper;";

  public:
    /**
     * Convert this Java/Kotlin-based struct to the C++ struct MapWrapper by copying all values to C++.
     */
    [[maybe_unused]]
    [[nodiscard]]
    MapWrapper toCpp() const {
      static const auto clazz = javaClassStatic();
      static const auto fieldMap = clazz->getField<jni::JMap<jni::JString, jni::JString>>("map");
      jni::local_ref<jni::JMap<jni::JString, jni::JString>> map = this->getFieldValue(fieldMap);
      return MapWrapper(
        [&]() {
          std::unordered_map<std::string, std::string> __map;
          __map.reserve(map->size());
          for (const auto& __entry : *map) {
            __map.emplace(__entry.first->toStdString(), __entry.second->toStdString());
          }
          return __map;
        }()
      );
    }

  public:
    /**
     * Create a Java/Kotlin-based struct by copying all values from the given C++ struct to Java.
     */
    [[maybe_unused]]
    static jni::local_ref<JMapWrapper::javaobject> fromCpp(const MapWrapper& value) {
      return newInstance(
        [&]() -> jni::local_ref<jni::JMap<jni::JString, jni::JString>> {
          auto __map = jni::JHashMap<jni::JString, jni::JString>::create(value.map.size());
          for (const auto& __entry : value.map) {
            __map->put(jni::make_jstring(__entry.first), jni::make_jstring(__entry.second));
          }
          return __map;
        }()
      );
    }
  };

} // namespace margelo::nitro::image
