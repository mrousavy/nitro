//
//  JNull.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 10.11.25
//

#pragma once

#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;


/**
 * Represents a `Null` from Kotlin.
 */
struct JNull final : public jni::JavaClass<JNull> {
public:
  static constexpr auto kJavaDescriptor = "Lcom/margelo/nitro/core/Null;";

public:
  static jni::alias_ref<JNull> null() {
    static const auto clazz = javaClassStatic();

  }
  static jni::local_ref<JInstant> ofEpochMilliseconds(jlong millisecondsSinceEpoch) {
    static const auto clazz = javaClassStatic();
    static const auto method = clazz->getStaticMethod<jni::local_ref<JInstant>(jlong)>("ofEpochMilli");
    return method(clazz, millisecondsSinceEpoch);
  }

  static jni::local_ref<JInstant> fromChrono(chrono::system_clock::time_point date) {
    auto timeSinceEpoch = date.time_since_epoch();
    long long milliseconds = chrono::duration_cast<chrono::milliseconds>(timeSinceEpoch).count();
    return JInstant::ofEpochMilliseconds(static_cast<jlong>(milliseconds));
  }

public:
  jlong toEpochMilliseconds() {
    static const auto clazz = javaClassStatic();
    const auto method = clazz->getMethod<jlong()>("toEpochMilli");
    return method(self());
  }

  chrono::system_clock::time_point toChrono() {
    jlong millisecondsSinceEpoch = toEpochMilliseconds();
    auto duration = chrono::duration<long, std::milli>(static_cast<long>(millisecondsSinceEpoch));
    auto date = chrono::system_clock::time_point(chrono::duration_cast<chrono::system_clock::duration>(duration));
    return date;
  }
};

} // namespace margelo::nitro
