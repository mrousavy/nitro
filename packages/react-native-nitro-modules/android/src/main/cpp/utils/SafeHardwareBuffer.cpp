//
//  SafeHardwareBuffer.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 11.07.25.
//

#pragma once

#include "SafeHardwareBuffer.hpp"
#include <android/hardware_buffer.h>
#include <android/hardware_buffer_jni.h>
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

SafeHardwareBuffer::SafeHardwareBuffer(const jni::alias_ref<jni::JObject>& javaHardwareBuffer) {
#if __ANDROID_API__ >= 26
#ifdef NITRO_DEBUG
  if (javaHardwareBuffer == nullptr) [[unlikely]] {
    throw std::runtime_error("Cannot create SafeHardwareBuffer - Java HardwareBuffer was null!");
  }
#endif
  // Convert jobject to AHardwareBuffer* - this adds +1 retain count (we're at 1 total now)
  _buffer = AHardwareBuffer_fromHardwareBuffer(jni::Environment::current(), javaHardwareBuffer.get());
  _dataCached = nullptr;
  _isLocked = false;
#endif
}

SafeHardwareBuffer::SafeHardwareBuffer(AHardwareBuffer* /* +1 retained */ alreadyRetainedHardwareBuffer)
    : _buffer(alreadyRetainedHardwareBuffer), _dataCached(nullptr), _isLocked(false) {}

SafeHardwareBuffer::SafeHardwareBuffer(SafeHardwareBuffer&& move) noexcept
    : _buffer(move._buffer), _dataCached(move._dataCached), _isLocked(move._isLocked) {
  // remove the buffer pointer from the value moved into `this`
  move._buffer = nullptr;
  move._dataCached = nullptr;
  move._isLocked = false;
}

SafeHardwareBuffer::SafeHardwareBuffer(const SafeHardwareBuffer& copy) : _buffer(copy._buffer), _dataCached(nullptr), _isLocked(false) {
#if __ANDROID_API__ >= 26
  // Add +1 retain count since we copied it now
  AHardwareBuffer_acquire(_buffer);
#endif
}

SafeHardwareBuffer::~SafeHardwareBuffer() {
#if __ANDROID_API__ >= 26
  if (_buffer != nullptr) {
    if (_isLocked) {
      // If it was locked, unlock it now
      AHardwareBuffer_unlock(_buffer, nullptr);
    }
    // Release our 1 retain count of AHardwareBuffer*
    AHardwareBuffer_release(_buffer);
  }
#endif
}

uint8_t* SafeHardwareBuffer::data() {
  if (_isLocked && _dataCached != nullptr) {
    // We are still locked on the AHardwareBuffer* and have a valid buffer.
    return _dataCached;
  }
  void* buffer;
  int result = AHardwareBuffer_lock(_buffer, AHARDWAREBUFFER_USAGE_CPU_READ_MASK, -1, nullptr, &buffer);
  if (result != 0) {
    throw std::runtime_error("Failed to read HardwareBuffer bytes!");
  }
  _dataCached = static_cast<uint8_t*>(buffer);
  _isLocked = true;
  return _dataCached;
}

[[nodiscard]] size_t SafeHardwareBuffer::size() const {
#if __ANDROID_API__ >= 26
  AHardwareBuffer_Desc description;
  AHardwareBuffer_describe(_buffer, &description);
  size_t totalSize = description.height * description.stride;
  return totalSize;
#else
  throw HardwareBuffersUnavailable();
#endif
}

[[nodiscard]] jni::local_ref<jni::JObject> SafeHardwareBuffer::toJava() {
#if __ANDROID_API__ >= 26
  // 1. Convert AHardwareBuffer* to jobject - this will now be 2 retain counts
  jobject javaObject = AHardwareBuffer_toHardwareBuffer(jni::Environment::current(), _buffer);
  // 2. Revert to 1 retain count again
  AHardwareBuffer_release(_buffer);
  // 3. Return to Java
  return jni::adopt_local(javaObject);
#else
  throw HardwareBuffersUnavailable();
#endif
}

[[nodiscard]] AHardwareBuffer* SafeHardwareBuffer::buffer() const noexcept {
  return _buffer;
}

[[nodiscard]] AHardwareBuffer_Desc SafeHardwareBuffer::describe() const noexcept {
  AHardwareBuffer_Desc description;
  AHardwareBuffer_describe(_buffer, &description);
  return description;
}

} // namespace margelo::nitro
