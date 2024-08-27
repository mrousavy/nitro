//
//  ByteBufferArrayBuffer.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include "ArrayBuffer.hpp"
#include <fbjni/ByteBuffer.h>
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents an `ArrayBuffer` that holds a `ByteBuffer`.
 */
class ByteBufferArrayBuffer : public ArrayBuffer {
public:
  explicit ByteBufferArrayBuffer(jni::alias_ref<jni::JByteBuffer> byteBuffer) : _byteBuffer(jni::make_global(byteBuffer)) {
    _byteBuffer->order(jni::JByteOrder::bigEndian());
  }

public:
  uint8_t* data() override {
    return _byteBuffer->getDirectBytes();
  }
  size_t size() const override {
    return _byteBuffer->getDirectSize();
  }
  bool isOwner() const noexcept override {
    return _byteBuffer != nullptr && _byteBuffer->isDirect();
  }

public:
  jni::alias_ref<jni::JByteBuffer> getBuffer() const {
    return _byteBuffer;
  }

private:
  jni::global_ref<jni::JByteBuffer> _byteBuffer;
};

} // namespace margelo::nitro
