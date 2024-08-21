//
//  JPromise.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include <fbjni/fbjni.h>
#include <future>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents a Promise implemented in Java.
 */
struct JPromise : public jni::HybridClass<JPromise> {
public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/Promise;";
    using OnResolvedFunc = std::function<void(jni::global_ref<jni::JObject>)>;
    using OnRejectedFunc = std::function<void(jni::global_ref<jni::JString>)>;

public:
    /**
     * Create a new, still unresolved `JPromise` from Java.
     */
    static jni::local_ref<JPromise::jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis) {
        return makeCxxInstance();
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

public:
    void addOnResolvedListener(OnResolvedFunc&& onResolved) {
        _onResolvedListeners.push_back(std::move(onResolved));
    }
    void addOnRejectedListener(OnResolvedFunc&& onResolved) {
        _onResolvedListeners.push_back(std::move(onResolved));
    }

private:
    JPromise() {
    }

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
        makeNativeMethod("resolve", JPromise::resolve),
        makeNativeMethod("reject", JPromise::reject),
      });
    }
};


} // namespace margelo::nitro
