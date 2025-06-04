//
//  JInstant.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 19.11.24.
//

#pragma once

#include <fbjni/fbjni.h>
#include <chrono>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents an `Instant` from Kotlin.
 */
class JInstant final {
private:
  static constexpr auto kJavaDescriptor = "Ljava/time/Instant;";
  using namespace std;

public:

  static jni::local_ref<JInstant> ofEpochMilliseconds(jlong millisecondsSinceEpoch) {
    static const auto clazz = javaClassStatic();
    static const auto method = clazz->getStaticMethod<jni::local_ref<JInstant>(jlong)>("ofEpochMilliseconds");
    return method(clazz, millisecondsSinceEpoch);
  }

  static jni::local_ref<JInstant> fromChrono(chrono::system_clock::time_point date) {
    long milliseconds = chrono::duration_cast<chrono::millis>(date).count();
    return JInstant::ofEpochMilliseconds(static_cast<jlong>(milliseconds));
  }

public:
  jlong toEpochMilliseconds() {
    static const auto clazz = javaClassStatic();
    const auto method = clazz->getMethod<jlong()>("toEpochMilliseconds");
    return method(self());
  }

  chrono::system_clock::time_point toChrono() {
    jlong millisecondsSinceEpoch = toEpochMilliseconds();
    auto duration = chrono::duration<long, std::milli>(static_cast<long>(millisecondsSinceEpoch));
    auto date = chrono::system_clock::time_point(chrono::duration_cast<system_clock::duration>(duration));
    return date;
  }
};

} // namespace margelo::nitro
