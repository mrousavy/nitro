//
//  JArrayBuffer.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include <fbjni/fbjni.h>
#include <functional>
#include <utility>
#include <NitroModules/ArrayBuffer.hpp>
#include <fbjni/ByteBuffer.h>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents a Java `ArrayBuffer` that holds a `ByteBuffer`.
 * This is a owning Buffer, coming from Java.
 */
struct JArrayBuffer : public jni::HybridClass<JArrayBuffer>,
                      public ArrayBuffer {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/ArrayBuffer;";
  static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis,
                                                jni::alias_ref<jni::JByteBuffer> byteBuffer) {
      return makeCxxInstance(jThis, byteBuffer);
  }

public:
    uint8_t* data() override {
        return _byteBuffer->getDirectBytes();
    }
    size_t size() const override {
        return _byteBuffer->getDirectSize();
    }
    bool isOwner() const noexcept override {
        return true;
    }

private:
    JArrayBuffer(jni::alias_ref<jhybridobject> jThis,
                 jni::alias_ref<jni::JByteBuffer> byteBuffer):
                       _javaPart(jni::make_global(jThis)),
                       _byteBuffer(jni::make_global(byteBuffer)) {}

private:
    friend HybridBase;
    using HybridBase::HybridBase;
    jni::global_ref<javaobject> _javaPart;
    jni::global_ref<jni::JByteBuffer> _byteBuffer;

public:
    static void registerNatives() {
        registerHybrid({
                               makeNativeMethod("initHybrid", JArrayBuffer::initHybrid)
        });
    }
};


} // namespace margelo::nitro
