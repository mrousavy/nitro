//
//  SafeHardwareBuffer.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 11.07.25.
//

#pragma once

#include "NitroDefines.hpp"
#include <android/hardware_buffer.h>
#include <android/hardware_buffer_jni.h>
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

struct HardwareBuffersUnavailable : public std::exception {
  [[nodiscard]] const char* what() const noexcept override {
    return "ArrayBuffer(HardwareBuffer) requires NDK API 26 or above! (minSdk >= 26)";
  }
};
enum class LockFlag { READ, WRITE, READ_AND_WRITE };

using AHardwareBufferLockedFlag = unsigned long long;
static constexpr AHardwareBufferLockedFlag NOT_LOCKED = -1;

class SafeHardwareBuffer final {
private:
  explicit SafeHardwareBuffer(AHardwareBuffer* /* +1 retained */ alreadyRetainedHardwareBuffer);
  explicit SafeHardwareBuffer(const jni::alias_ref<jni::JObject>& javaHardwareBuffer);

public:
  SafeHardwareBuffer(SafeHardwareBuffer&& move) noexcept;
  SafeHardwareBuffer(const SafeHardwareBuffer& copy);
  ~SafeHardwareBuffer();

public:
  [[nodiscard]] void* data(LockFlag lockFlag);
  [[nodiscard]] size_t size() const;
  [[nodiscard]] jni::local_ref<jni::JObject> toJava() const;

public:
  /**
   * Unlocks the underlying `AHardwareBuffer`.
   * The `AHardwareBuffer` will also automatically be unlocked,
   * but this is safe to call if you want to take ownership.
   */
  void unlock();

public:
  /**
   * Returns the reference to this underlying `AHardwareBuffer*`.
   * The `AHardwareBuffer*` is guaranteed to be alive as long as this
   * `SafeHardwareBuffer` instance is alive. If you want it longer, _acquire it.
   */
  [[nodiscard]] AHardwareBuffer* buffer() const noexcept;
  [[nodiscard]] AHardwareBuffer_Desc describe() const;

private:
  bool isLockedForFlag(LockFlag lockFlag) const noexcept;
  bool isLocked() const noexcept;
  static AHardwareBufferLockedFlag getHardwareBufferUsageFlag(LockFlag lockFlag);

public:
  /**
   * Wraps the given Java `HardwareBuffer` (boxed to a jobject) in a `SafeHardwareBuffer`.
   * The returned `SafeHardwareBuffer` will retain the `AHardwareBuffer*` retain count via RAII.
   * The given Java `HardwareBuffer` does not have to stay alive.
   */
  static SafeHardwareBuffer fromJava(const jni::alias_ref<jni::JObject>& javaHardwareBuffer) {
    return SafeHardwareBuffer(javaHardwareBuffer);
  }
  /**
   * Wraps the given C++ `AHardwareBuffer*` in a `SafeHardwareBuffer`.
   * The given `AHardwareBuffer*` has to have an already retained ref-count of +1.
   * This is usually the case when you call one of these methods to get your `AHardwareBuffer*`:
   * - `AHardwareBuffer_allocate`
   * - `AHardwareBuffer_fromJava`
   * - `AHardwareBuffer_acquire`
   * The returned `SafeHardwareBuffer` will retain the `AHardwareBuffer*` retain count via RAII.
   */
  static SafeHardwareBuffer wrapAlreadyRetainedAHardwareBuffer(AHardwareBuffer* /* +1 retained */ alreadyRetainedHardwareBuffer) {
    return SafeHardwareBuffer(alreadyRetainedHardwareBuffer);
  }
  /**
   * Allocates a new `SafeHardwareBuffer` (and the underlying `AHardwareBuffer*`) from the given
   * `AHardwareBuffer_Desc` (buffer description).
   * The returned `SafeHardwareBuffer` will retain the `AHardwareBuffer*` retain count via RAII.
   */
  static SafeHardwareBuffer allocate(AHardwareBuffer_Desc description) {
    // Allocate with description (create +1 ref)
    AHardwareBuffer* buffer;
    AHardwareBuffer_allocate(&description, &buffer);
    return SafeHardwareBuffer(buffer);
  }

public:
  /**
   * Ensures that a `AHardwareBuffer*` with the given `AHardwareBuffer_Desc`
   * is CPU-readable.
   * If it isn't, this method throws.
   */
  static void ensureCpuReadable(const AHardwareBuffer_Desc& description);

private:
  AHardwareBuffer* _buffer;
  void* _dataCached;
  AHardwareBufferLockedFlag _currentlyLockedFlag;
};

} // namespace margelo::nitro
