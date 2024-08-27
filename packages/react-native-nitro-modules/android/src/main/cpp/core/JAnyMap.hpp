//
//  JAnyMap.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include <fbjni/fbjni.h>
#include "AnyMap.hpp"

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents a Promise implemented in Java.
 */
class JAnyMap : public jni::HybridClass<JAnyMap> {
public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/AnyMap;";

public:
    /**
     * Create a new, still unresolved `JPromise` from Java.
     */
    static jni::local_ref<JAnyMap::jhybriddata> initHybrid(jni::alias_ref<jhybridobject>) {
        return makeCxxInstance();
    }

private:
    JAnyMap() {
    }

private:
    friend HybridBase;
    using HybridBase::HybridBase;
    jni::global_ref<jni::JObject> _result;
    jni::global_ref<jni::JString> _error;

public:
    static void registerNatives() {
      registerHybrid({
        makeNativeMethod("initHybrid", JAnyMap::initHybrid),
      });
    }
};


} // namespace margelo::nitro