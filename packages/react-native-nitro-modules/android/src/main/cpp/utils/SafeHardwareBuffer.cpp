//
//  SafeHardwareBuffer.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 11.07.25.
//

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
  _currentlyLockedFlag = NOT_LOCKED;

#ifdef NITRO_DEBUG
  ensureCpuReadable(describe());
#endif
#endif
}

SafeHardwareBuffer::SafeHardwareBuffer(AHardwareBuffer* /* +1 retained */ alreadyRetainedHardwareBuffer)
    : _buffer(alreadyRetainedHardwareBuffer), _dataCached(nullptr), _currentlyLockedFlag(NOT_LOCKED) {

#ifdef NITRO_DEBUG
  ensureCpuReadable(describe());
#endif
}

SafeHardwareBuffer::SafeHardwareBuffer(SafeHardwareBuffer&& move) noexcept
    : _buffer(move._buffer), _dataCached(move._dataCached), _currentlyLockedFlag(move._currentlyLockedFlag) {
  // remove the buffer pointer from the value moved into `this`
  move._buffer = nullptr;
  move._dataCached = nullptr;
  move._currentlyLockedFlag = NOT_LOCKED;

#ifdef NITRO_DEBUG
  ensureCpuReadable(describe());
#endif
}

SafeHardwareBuffer::SafeHardwareBuffer(const SafeHardwareBuffer& copy)
    : _buffer(copy._buffer), _dataCached(nullptr), _currentlyLockedFlag(NOT_LOCKED) {
#if __ANDROID_API__ >= 26
  // Add +1 retain count since we copied it now
  AHardwareBuffer_acquire(_buffer);
#endif
}

SafeHardwareBuffer::~SafeHardwareBuffer() {
#if __ANDROID_API__ >= 26
  if (_buffer != nullptr) {
    unlock();
    // Release our 1 retain count of AHardwareBuffer*
    AHardwareBuffer_release(_buffer);
  }
#endif
}

void* SafeHardwareBuffer::data(LockFlag lockFlag) {
  if (isLockedForFlag(lockFlag) && _dataCached != nullptr) {
    // We are still locked on the AHardwareBuffer* and have a valid buffer.
    return _dataCached;
  }
  int targetLockFlags = getHardwareBufferUsageFlag(lockFlag);
  void* buffer;
  int result = AHardwareBuffer_lock(_buffer, targetLockFlags, -1, nullptr, &buffer);
  if (result != 0) {
    ensureCpuReadable(describe());
    throw std::runtime_error("Failed to read HardwareBuffer bytes! Error Code: " + std::to_string(result));
  }
  _dataCached = buffer;
  _currentlyLockedFlag = targetLockFlags;
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

[[nodiscard]] jni::local_ref<jni::JObject> SafeHardwareBuffer::toJava() const {
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

void SafeHardwareBuffer::unlock() {
  if (isLocked()) {
    // If it was locked, unlock it now
    AHardwareBuffer_unlock(_buffer, nullptr);
  }
  _currentlyLockedFlag = NOT_LOCKED;
  _dataCached = nullptr;
}

[[nodiscard]] AHardwareBuffer* SafeHardwareBuffer::buffer() const noexcept {
  return _buffer;
}

[[nodiscard]] AHardwareBuffer_Desc SafeHardwareBuffer::describe() const {
  AHardwareBuffer_Desc description;
  AHardwareBuffer_describe(_buffer, &description);
  return description;
}

bool SafeHardwareBuffer::isLockedForFlag(LockFlag lockFlag) const noexcept {
  AHardwareBufferLockedFlag targetFlag = getHardwareBufferUsageFlag(lockFlag);
  return (_currentlyLockedFlag & targetFlag) == 0;
}
bool SafeHardwareBuffer::isLocked() const noexcept {
  return _currentlyLockedFlag != NOT_LOCKED;
}
AHardwareBufferLockedFlag SafeHardwareBuffer::getHardwareBufferUsageFlag(LockFlag lockFlag) {
  switch (lockFlag) {
    case LockFlag::READ:
      return AHARDWAREBUFFER_USAGE_CPU_READ_MASK;
    case LockFlag::WRITE:
      return AHARDWAREBUFFER_USAGE_CPU_WRITE_MASK;
    case LockFlag::READ_AND_WRITE:
      return AHARDWAREBUFFER_USAGE_CPU_READ_MASK | AHARDWAREBUFFER_USAGE_CPU_WRITE_MASK;
  }
}

void SafeHardwareBuffer::ensureCpuReadable(const AHardwareBuffer_Desc& description) {
  int cpuUsageFlags = description.usage & (AHARDWAREBUFFER_USAGE_CPU_READ_OFTEN | AHARDWAREBUFFER_USAGE_CPU_READ_RARELY);
  if (cpuUsageFlags == 0) {
    // we don't have any CPU_READ_* flags set! not readable
    throw std::runtime_error("The given HardwareBuffer is not CPU-readable, because it doesn't contain "
                             "a AHARDWAREBUFFER_USAGE_CPU_READ_OFTEN or AHARDWAREBUFFER_USAGE_CPU_READ_RARELY flag!");
  }
  bool protectedFlags = description.usage & AHARDWAREBUFFER_USAGE_PROTECTED_CONTENT;
  if (protectedFlags != 0) {
    // the PROTECTED_CONTENT flag is set! not readable
    throw std::runtime_error("The given HardwareBuffer is not CPU-readable, because it has the "
                             "AHARDWAREBUFFER_USAGE_PROTECTED_CONTENT flag!");
  }
}

} // namespace margelo::nitro
