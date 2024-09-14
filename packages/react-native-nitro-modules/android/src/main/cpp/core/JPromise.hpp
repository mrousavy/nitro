//
//  JPromise.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include <fbjni/fbjni.h>
#include "JNativeFunction.hpp"

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents a Promise implemented in Java.
 */
template<typename T>
struct JPromise final : public jni::JavaClass<JPromise<T>> {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/Promise;";
  using OnResolvedFunc = std::function<void(jni::alias_ref<T>)>;
  using OnRejectedFunc = std::function<void(jni::alias_ref<jni::JString>)>;

  using jni::JavaClass<JPromise<T>>::javaClassStatic;
  using jni::JavaClass<JPromise<T>>::self;

public:
  void resolve(jni::alias_ref<jni::JObject> result) {
    static const auto method = javaClassStatic()->template getMethod<void(jni::alias_ref<jni::JObject>)>("resolve");
    method(self(), result);
  }
  void reject(jni::alias_ref<jni::JString> error) {
    static const auto method = javaClassStatic()->template getMethod<void(jni::alias_ref<jni::JString>)>("reject");
    method(self(), error);
  }

public:
  void addOnResolvedListener(OnResolvedFunc&& onResolved) {
    static const auto method = javaClassStatic()->template getMethod<void(jni::alias_ref<JNativeFunction::javaobject>)>("addOnResolvedListener");
    auto nativeFunction = JNativeFunction::create([onResolved = std::move(onResolved)](const jni::alias_ref<jni::JObject>& value) {
        onResolved(jni::static_ref_cast<T>(value));
    });
    method(self(), nativeFunction);
  }
  void addOnRejectedListener(OnRejectedFunc&& onRejected) {
      static const auto method = javaClassStatic()->template getMethod<void(jni::alias_ref<JNativeFunction::javaobject>)>("addOnRejectedListener");
      auto nativeFunction = JNativeFunction::create([onResolved = std::move(onRejected)](const jni::alias_ref<jni::JObject>& value) {
          onResolved(jni::static_ref_cast<jni::JString>(value));
      });
      method(self(), nativeFunction);
  }
};

} // namespace margelo::nitro
