//
//  SafeHardwareBuffer.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 11.07.25.
//

#pragma once

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

class SafeHardwareBuffer final {
private:
  explicit SafeHardwareBuffer(AHardwareBuffer* /* +1 retained */ alreadyRetainedHardwareBuffer);
  explicit SafeHardwareBuffer(const jni::alias_ref<jni::JObject>& javaHardwareBuffer);

public:
  SafeHardwareBuffer(SafeHardwareBuffer&& move) noexcept;
  SafeHardwareBuffer(const SafeHardwareBuffer& copy);
  ~SafeHardwareBuffer();

public:
  [[nodiscard]] uint8_t* data();
  [[nodiscard]] size_t size() const;
  [[nodiscard]] jni::local_ref<jni::JObject> toJava();

public:
  /**
   * Returns the reference to this underlying `AHardwareBuffer*`.
   * The `AHardwareBuffer*` is guaranteed to be alive as long as this
   * `SafeHardwareBuffer` instance is alive. If you want it longer, _acquire it.
   */
  [[nodiscard]] AHardwareBuffer* buffer() const noexcept;
  [[nodiscard]] AHardwareBuffer_Desc describe() const;

public:
  static SafeHardwareBuffer fromJava(const jni::alias_ref<jni::JObject>& javaHardwareBuffer) {
    return SafeHardwareBuffer(javaHardwareBuffer);
  }
  static SafeHardwareBuffer wrapAlreadyRetainedAHardwareBuffer(AHardwareBuffer* /* +1 retained */ alreadyRetainedHardwareBuffer) {
    return SafeHardwareBuffer(alreadyRetainedHardwareBuffer);
  }
  static SafeHardwareBuffer allocate(AHardwareBuffer_Desc* description) {
    // Allocate with description (create +1 ref)
    AHardwareBuffer* buffer;
    AHardwareBuffer_allocate(description, &buffer);
    return SafeHardwareBuffer(buffer);
  }

private:
  AHardwareBuffer* _buffer;
  uint8_t* _dataCached;
  bool _isLocked;
};

} // namespace margelo::nitro
