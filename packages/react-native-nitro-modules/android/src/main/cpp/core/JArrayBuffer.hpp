//
//  JArrayBuffer.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include "ArrayBuffer.hpp"
#include "ByteBufferArrayBuffer.hpp"
#include "HardwareBufferArrayBuffer.hpp"
#include "SafeHardwareBuffer.hpp"
#include <android/hardware_buffer.h>
#include <android/hardware_buffer_jni.h>
#include <fbjni/ByteBuffer.h>
#include <fbjni/fbjni.h>
#include <functional>
#include <utility>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents a `ArrayBuffer` that can either hold a `ByteBuffer` (owning),
 * or unknown/foreign memory, potentially from JS (non-owning).
 */
class JArrayBuffer final : public jni::HybridClass<JArrayBuffer> {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/ArrayBuffer;";

public:
  /**
   * Create a new `JArrayBuffer` that wraps the given ArrayBuffer.
   */
  static jni::local_ref<JArrayBuffer::javaobject> wrap(const std::shared_ptr<ArrayBuffer>& arrayBuffer) {
    return newObjectCxxArgs(arrayBuffer);
  }

public:
  /**
   * Create a new `JArrayBuffer` that wraps the given `ByteBuffer` from Java.
   */
  static jni::local_ref<JArrayBuffer::jhybriddata> initHybridByteBuffer(jni::alias_ref<jhybridobject>,
                                                                        jni::alias_ref<jni::JByteBuffer> buffer) {
    return makeCxxInstance(buffer);
  }
  /**
   * Create a new `JArrayBuffer` that wraps the given `HardwareBuffer` from Java.
   */
  static jni::local_ref<JArrayBuffer::jhybriddata>
  initHybridHardwareBuffer(jni::alias_ref<jhybridobject>, [[maybe_unused]] jni::alias_ref<jni::JObject> boxedHardwareBuffer) {
    SafeHardwareBuffer buffer = SafeHardwareBuffer::fromJava(boxedHardwareBuffer);
    return makeCxxInstance(std::move(buffer));
  }

public:
  /**
   * Get whether the `ArrayBuffer` is owning the data and can safely hold onto it longer.
   */
  bool getIsOwner() {
    return _arrayBuffer->isOwner();
  }

  /**
   * Get the underlying `ArrayBuffer`.
   */
  [[nodiscard]] std::shared_ptr<ArrayBuffer> getArrayBuffer() const {
    return _arrayBuffer;
  }

public:
  /**
   * Get whether the `ArrayBuffer` is holding data from a `ByteBuffer`.
   */
  bool getIsByteBuffer() {
    auto byteBufferArrayBuffer = std::dynamic_pointer_cast<ByteBufferArrayBuffer>(_arrayBuffer);
    return byteBufferArrayBuffer != nullptr;
  }

  /**
   * Get the `ArrayBuffer`'s data as a `ByteBuffer`.
   *
   * - If the `ArrayBuffer` was created from a `ByteBuffer` (`isByteBuffer()`), this returns
   * a reference to the original `ByteBuffer`, which is safe to be kept in memory for longer.
   * - If the `ArrayBuffer` was created elsewhere (either in JS, or in C++), it does not have a
   * `ByteBuffer`. In this case, `getBuffer()` will **copy** the data into a new `ByteBuffer` if
   * `copyIfNeeded` is `true`, and **wrap** the data into a new `ByteBuffer` if `copyIfNeeded` is false.
   */
  [[nodiscard]] jni::local_ref<jni::JByteBuffer> getByteBuffer(bool copyIfNeeded) {
    auto byteBufferArrayBuffer = std::dynamic_pointer_cast<ByteBufferArrayBuffer>(_arrayBuffer);
    if (byteBufferArrayBuffer != nullptr) {
      // It is a `ByteBufferArrayBuffer`, which has a `ByteBuffer` underneath!
      return jni::make_local(byteBufferArrayBuffer->getBuffer());
    } else {
      // It is a different kind of `ArrayBuffer`, we need to copy or wrap the data.
      size_t size = _arrayBuffer->size();
      if (copyIfNeeded) {
        auto buffer = jni::JByteBuffer::allocateDirect(size);
        buffer->order(jni::JByteOrder::nativeOrder());
        memcpy(buffer->getDirectAddress(), _arrayBuffer->data(), size);
        return buffer;
      } else {
        auto buffer = jni::JByteBuffer::wrapBytes(_arrayBuffer->data(), size);
        buffer->order(jni::JByteOrder::nativeOrder());
        return buffer;
      }
    }
  }

public:
  /**
   * Get whether the `ArrayBuffer` is holding data from a `HardwareBuffer`.
   */
  bool getIsHardwareBuffer() {
    auto hardwareBufferArrayBuffer = std::dynamic_pointer_cast<HardwareBufferArrayBuffer>(_arrayBuffer);
    return hardwareBufferArrayBuffer != nullptr;
  }

  /**
   * Get the underlying `HardwareBuffer` if it has one.
   * This method will throw if this `ArrayBuffer` was not created with a `HardwareBuffer`.
   */
  [[nodiscard]] const SafeHardwareBuffer& getHardwareBuffer() const {
    auto hardwareBufferArrayBuffer = std::dynamic_pointer_cast<HardwareBufferArrayBuffer>(_arrayBuffer);
    if (hardwareBufferArrayBuffer != nullptr) {
      return hardwareBufferArrayBuffer->getHardwareBuffer();
    } else {
      throw std::runtime_error("The underlying buffer is not a HardwareBuffer!");
    }
  }

  /**
   * Get the underlying `HardwareBuffer` as a java boxed `HardwareBuffer` reference.
   */
  [[nodiscard]] jni::local_ref<jni::JObject> getHardwareBufferBoxed() {
    const SafeHardwareBuffer& hardwareBuffer = getHardwareBuffer();
    return hardwareBuffer.toJava();
  }

  int getBufferSize() {
    return static_cast<int>(_arrayBuffer->size());
  }

public:
private:
  explicit JArrayBuffer(const std::shared_ptr<ArrayBuffer>& arrayBuffer) : _arrayBuffer(arrayBuffer) {}
  explicit JArrayBuffer(const jni::alias_ref<jni::JByteBuffer>& byteBuffer) {
    _arrayBuffer = std::make_shared<ByteBufferArrayBuffer>(byteBuffer);
  }
  explicit JArrayBuffer(SafeHardwareBuffer&& hardwareBuffer) {
    _arrayBuffer = std::make_shared<HardwareBufferArrayBuffer>(std::move(hardwareBuffer));
  }

private:
  friend HybridBase;
  using HybridBase::HybridBase;
  std::shared_ptr<ArrayBuffer> _arrayBuffer;

public:
  static void registerNatives() {
    registerHybrid(
        {makeNativeMethod("initHybrid", JArrayBuffer::initHybridByteBuffer),
         makeNativeMethod("initHybridBoxedHardwareBuffer", JArrayBuffer::initHybridHardwareBuffer),
         makeNativeMethod("getByteBuffer", JArrayBuffer::getByteBuffer), makeNativeMethod("getIsByteBuffer", JArrayBuffer::getIsByteBuffer),
         makeNativeMethod("getHardwareBufferBoxed", JArrayBuffer::getHardwareBufferBoxed),
         makeNativeMethod("getIsHardwareBuffer", JArrayBuffer::getIsHardwareBuffer),
         makeNativeMethod("getIsOwner", JArrayBuffer::getIsOwner), makeNativeMethod("getBufferSize", JArrayBuffer::getBufferSize)});
  }
};

} // namespace margelo::nitro
