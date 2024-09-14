//
//  JPromise.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents a NativeFunction in Java.
 */
class JNativeFunction final : public jni::HybridClass<JNativeFunction> {
public:
  using TFunc = std::function<void(const jni::alias_ref<jni::JObject>& /* value */)>;
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/NativeFunction;";

  static jni::local_ref<JNativeFunction::javaobject> create(TFunc&& function) {
    return newObjectCxxArgs(std::move(function));
  }

public:
  void invoke(jni::alias_ref<jni::JObject> value) {
    _function(value);
  }

private:
  explicit JNativeFunction(TFunc&& function) : _function(std::move(function)) {}

private:
  friend HybridBase;
  using HybridBase::HybridBase;
  TFunc _function;

public:
  static void registerNatives() {
    registerHybrid({
        makeNativeMethod("invokeBoxed", JNativeFunction::invoke),
    });
  }
};

} // namespace margelo::nitro
