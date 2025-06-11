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
  static jni::local_ref<JArrayBuffer::jhybriddata> initHybridHardwareBuffer(jni::alias_ref<jhybridobject>,
                                                                            jni::alias_ref<jni::JObject> boxedHardwareBuffer) {
#if __ANDROID_API__ >= 26
    // Cast jobject* to AHardwareBuffer*. It has a retain count of 0 which will be retained in `HardwareBufferArrayBuffer(..)`.
    AHardwareBuffer* hardwareBuffer = AHardwareBuffer_fromHardwareBuffer(jni::Environment::current(), boxedHardwareBuffer.get());
    return makeCxxInstance(hardwareBuffer);
#else
    throw std::runtime_error("ArrayBuffer(HardwareBuffer) requires NDK API 26 or above! (minSdk >= 26)");
#endif
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
   * Get whether the `ArrayBuffer` is owning the data and can safely hold onto it longer.
   */
  bool getIsOwner() {
    return _arrayBuffer->isOwner();
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

  int getBufferSize() {
    return static_cast<int>(_arrayBuffer->size());
  }

public:
  /**
   * Get the underlying `ArrayBuffer`.
   */
  [[nodiscard]] std::shared_ptr<ArrayBuffer> getArrayBuffer() const {
    return _arrayBuffer;
  }

public:
#if __ANDROID_API__ >= 26
  static jni::alias_ref<jni::JObject> copyHardwareBuffer(jni::alias_ref<jni::JObject> hardwareBufferBoxed) {
    // 1. Get info about input buffer
    AHardwareBuffer* hardwareBuffer = AHardwareBuffer_fromHardwareBuffer(jni::Environment::current(), hardwareBufferBoxed.get());
    AHardwareBuffer_Desc description;
    AHardwareBuffer_describe(hardwareBuffer, &description);
    size_t size = description.height * description.stride;

    // 2. Allocate output buffer using same description as input buffer
    AHardwareBuffer* result;
    AHardwareBuffer_allocate(&description, &result);

    // 3. Copy data over
    void* inputData;
    void* outputData;
    int lockSource = AHardwareBuffer_lock(hardwareBuffer, AHARDWAREBUFFER_USAGE_CPU_READ_MASK, -1, nullptr, &inputData);
    if (lockSource != 0) {
      throw std::runtime_error("Failed to lock input HardwareBuffer!");
    }
    int lockDestination = AHardwareBuffer_lock(result, AHARDWAREBUFFER_USAGE_CPU_WRITE_MASK, -1, nullptr, &outputData);
    if (lockDestination != 0) {
      AHardwareBuffer_unlock(hardwareBuffer, nullptr);
      throw std::runtime_error("Failed to lock resulting HardwareBuffer!");
    }
    memcpy(outputData, inputData, size);
    AHardwareBuffer_unlock(hardwareBuffer, nullptr);
    AHardwareBuffer_unlock(result, nullptr);

    // 4. Box it & return it to Java
    jobject boxedResult = AHardwareBuffer_toHardwareBuffer(jni::Environment::current(), result);
    return boxedResult;
  }
#endif

private:
  explicit JArrayBuffer(const std::shared_ptr<ArrayBuffer>& arrayBuffer) : _arrayBuffer(arrayBuffer) {}
  explicit JArrayBuffer(const jni::alias_ref<jni::JByteBuffer>& byteBuffer) {
    _arrayBuffer = std::make_shared<ByteBufferArrayBuffer>(byteBuffer);
  }

#if __ANDROID_API__ >= 26
  explicit JArrayBuffer(AHardwareBuffer* /* 0 retain */ hardwareBuffer) {
    _arrayBuffer = std::make_shared<HardwareBufferArrayBuffer>(hardwareBuffer);
  }
#endif

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
         makeNativeMethod("getIsOwner", JArrayBuffer::getIsOwner), makeNativeMethod("getBufferSize", JArrayBuffer::getBufferSize),
         makeNativeMethod("copyHardwareBuffer", JArrayBuffer::copyHardwareBuffer)});
  }
};

} // namespace margelo::nitro
