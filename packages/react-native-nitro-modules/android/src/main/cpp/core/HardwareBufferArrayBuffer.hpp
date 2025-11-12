//
//  HardwareBufferArrayBuffer.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include "ArrayBuffer.hpp"
#include "JHardwareBufferUtils.hpp"
#include "SafeHardwareBuffer.hpp"
#include <android/hardware_buffer.h>
#include <android/hardware_buffer_jni.h>
#include <fbjni/ByteBuffer.h>
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents an `ArrayBuffer` that holds a `HardwareBuffer`.
 */
class HardwareBufferArrayBuffer final : public ArrayBuffer {
public:
  /**
   * Create a new `HardwareBufferArrayBuffer` instance that wraps the given `SafeHardwareBuffer`.
   * `SafeHardwareBuffer` is managing the retain count of `AHardwareBuffer*`.
   */
  explicit HardwareBufferArrayBuffer(SafeHardwareBuffer&& hardwareBuffer) : _hardwareBuffer(std::move(hardwareBuffer)) {}

public:
  [[nodiscard]] uint8_t* data() override {
    void* data = _hardwareBuffer.data(LockFlag::READ);
    return static_cast<uint8_t*>(data);
  }
  [[nodiscard]] size_t size() const override {
    return _hardwareBuffer.size();
  }
  [[nodiscard]] bool isOwner() const noexcept override {
    return true;
  }

public:
    [[nodiscard]]
  const SafeHardwareBuffer& getHardwareBuffer() const noexcept {
    return _hardwareBuffer;
  }

private:
  SafeHardwareBuffer _hardwareBuffer;
};

} // namespace margelo::nitro
