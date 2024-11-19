//
//  JPromise.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include "Promise.hpp"
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

struct JOnResolvedCallback : public jni::JavaClass<JOnResolvedCallback> {
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/Promise$OnResolvedCallback;";
    void onResolved(jni::alias_ref<jni::JObject> result) const {
        static const auto method = javaClassLocal()->getMethod<void(jni::alias_ref<jni::JObject>)>("onResolved");
        method(self(), result);
    }
};

struct JOnRejectedCallback : public jni::JavaClass<JOnRejectedCallback> {
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/Promise$OnRejectedCallback;";
    void onRejected(jni::alias_ref<jni::JString> error) const {
        static const auto method = javaClassLocal()->getMethod<void(jni::alias_ref<jni::JString>)>("onRejected");
        method(self(), error);
    }
};


/**
 * Represents a Promise implemented in Java.
 */
class JPromise final : public jni::HybridClass<JPromise> {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/Promise;";
  using OnResolvedFunc = std::function<void(jni::alias_ref<jni::JObject>)>;
  using OnRejectedFunc = std::function<void(jni::alias_ref<jni::JString>)>;

private:
  /**
   * Create a new, still unresolved `JPromise` from Java.
   */
  static jni::local_ref<JPromise::jhybriddata> initHybrid(jni::alias_ref<jhybridobject>) {
    return makeCxxInstance();
  }

public:
  /**
   * Create a new, still unresolved `JPromise` from C++.
   */
  static jni::local_ref<JPromise::javaobject> create() {
    return newObjectCxxArgs();
  }

public:
  void resolve(jni::alias_ref<jni::JObject> result) {
    _result = jni::make_global(result);
    for (const auto& onResolved : _onResolvedListeners) {
      onResolved(_result);
    }
  }
  void reject(jni::alias_ref<jni::JString> error) {
    _error = jni::make_global(error);
    for (const auto& onRejected : _onRejectedListeners) {
      onRejected(_error);
    }
  }

    void addOnResolvedListenerJava(jni::alias_ref<JOnResolvedCallback> callback) {
        if (_result != nullptr) {
            // Promise is already resolved! Call the callback immediately
            callback->onResolved(_result);
        } else {
            // Promise is not yet resolved, put the listener in our queue.
            auto sharedCallback = jni::make_global(callback);
            _onResolvedListeners.push_back([=](const jni::alias_ref<jni::JObject>& result) {
                sharedCallback->onResolved(result);
            });
        }
    }
    void addOnRejectedListenerJava(jni::alias_ref<JOnRejectedCallback> callback) {
        if (_error != nullptr) {
            // Promise is already rejected! Call the callback immediately
            callback->onRejected(_error);
        } else {
            // Promise is not yet rejected, put the listener in our queue.
            auto sharedCallback = jni::make_global(callback);
            _onRejectedListeners.push_back([=](const jni::alias_ref<jni::JString>& error) {
                sharedCallback->onRejected(error);
            });
        }
    }

public:
  void addOnResolvedListener(OnResolvedFunc&& onResolved) {
    if (_result != nullptr) {
      // Promise is already resolved! Call the callback immediately
      onResolved(_result);
    } else {
      // Promise is not yet resolved, put the listener in our queue.
      _onResolvedListeners.push_back(std::move(onResolved));
    }
  }
  void addOnRejectedListener(OnRejectedFunc&& onRejected) {
    if (_error != nullptr) {
      // Promise is already rejected! Call the callback immediately
      onRejected(_error);
    } else {
      // Promise is not yet rejected, put the listener in our queue.
      _onRejectedListeners.push_back(std::move(onRejected));
    }
  }

private:
  JPromise() = default;

private:
  friend HybridBase;
  using HybridBase::HybridBase;
  jni::global_ref<jni::JObject> _result;
  jni::global_ref<jni::JString> _error;
  std::vector<OnResolvedFunc> _onResolvedListeners;
  std::vector<OnRejectedFunc> _onRejectedListeners;

public:
  static void registerNatives() {
    registerHybrid({
        makeNativeMethod("initHybrid", JPromise::initHybrid),
        makeNativeMethod("nativeResolve", JPromise::resolve),
        makeNativeMethod("nativeReject", JPromise::reject),
        makeNativeMethod("nativeAddOnResolvedListener", JPromise::addOnResolvedListenerJava),
        makeNativeMethod("nativeAddOnRejectedListener", JPromise::addOnRejectedListenerJava),
    });
  }
};

} // namespace margelo::nitro
