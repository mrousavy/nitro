//
//  PixelBufferArrayBuffer.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 09.08.26.
//

#pragma once

#include "ArrayBuffer.hpp"
#include "PixelBufferUtils.hpp"
#include <CoreVideo/CVPixelBuffer.h>
#include <stdexcept>
#include <string>

namespace margelo::nitro {

/**
 * An `ArrayBuffer` backed by a `CVPixelBuffer`.
 *
 * Owns the buffer for its lifetime (`CVPixelBufferRetain` / `CVPixelBufferRelease`).
 * Destruction is safe if Hermes GC runs off the JS thread.
 */
class PixelBufferArrayBuffer final : public ArrayBuffer {
public:
  /**
   * Wraps the given `CVPixelBuffer` and calls `CVPixelBufferRetain`.
   * Requires CPU-readable access so `data()` can fulfill the `ArrayBuffer` contract.
   */
  explicit PixelBufferArrayBuffer(CVPixelBufferRef pixelBuffer) : _pixelBuffer(pixelBuffer), _dataCached(nullptr), _isLocked(false) {
    if (pixelBuffer == nullptr) [[unlikely]] {
      throw std::runtime_error("Cannot create CVPixelBuffer-backed ArrayBuffer from a null CVPixelBuffer!");
    }
    if (!isPixelBufferCPUReadable(pixelBuffer)) [[unlikely]] {
      throw std::runtime_error("Cannot create CVPixelBuffer-backed ArrayBuffer - the given "
                               "CVPixelBuffer does not allow CPU reads!");
    }
    CVPixelBufferRetain(pixelBuffer);
  }

  ~PixelBufferArrayBuffer() override {
    // Hermes GC can destroy JS objects on a non-JS thread.
    unlock();
    CVPixelBufferRelease(_pixelBuffer);
  }

public:
  /**
   * Returns whether `pixelBuffer` can be locked for CPU reads via
   * `CVPixelBufferLockBaseAddress`. Used at wrap-time to reject buffers that
   * cannot satisfy `data()`.
   */
  static bool isPixelBufferCPUReadable(CVPixelBufferRef pixelBuffer) {
    const CVReturn result = CVPixelBufferLockBaseAddress(pixelBuffer, kCVPixelBufferLock_ReadOnly);
    if (result != kCVReturnSuccess) {
      return false;
    }
    CVPixelBufferUnlockBaseAddress(pixelBuffer, kCVPixelBufferLock_ReadOnly);
    return true;
  }

public:
  /**
   * Unlocks the `CVPixelBuffer` if it was locked by `data()`.
   * Subsequent calls to `data()` will lock again.
   */
  void unlock() {
    if (_isLocked) {
      CVPixelBufferUnlockBaseAddress(_pixelBuffer, 0);
      _isLocked = false;
    }
    _dataCached = nullptr;
  }

public:
  [[nodiscard]] uint8_t* data() override {
    if (CVPixelBufferIsPlanar(_pixelBuffer)) [[unlikely]] {
      throw std::runtime_error("Cannot get contiguous `data()` from a planar CVPixelBuffer "
                               "(e.g. 420YpCbCr8BiPlanar). Use `getPixelBuffer()` for "
                               "zero-copy multi-plane / GPU access instead.");
    }
    if (_isLocked && _dataCached != nullptr) {
      return _dataCached;
    }
    const CVReturn result = CVPixelBufferLockBaseAddress(_pixelBuffer, 0);
    if (result != kCVReturnSuccess) [[unlikely]] {
      throw std::runtime_error("Failed to lock CVPixelBuffer for CPU access! CVReturn: " + std::to_string(result));
    }
    void* buffer = CVPixelBufferGetBaseAddress(_pixelBuffer);
    if (buffer == nullptr) [[unlikely]] {
      CVPixelBufferUnlockBaseAddress(_pixelBuffer, 0);
      throw std::runtime_error("Failed to read CVPixelBuffer bytes - base address is null!");
    }
    _dataCached = static_cast<uint8_t*>(buffer);
    _isLocked = true;
    return _dataCached;
  }

  [[nodiscard]] size_t size() const override {
    return PixelBufferUtils::getPixelBufferSize(_pixelBuffer);
  }

  [[nodiscard]] bool isOwner() const noexcept override {
    return true;
  }

public:
  [[nodiscard]] CVPixelBufferRef getBuffer() const {
    return _pixelBuffer;
  }

private:
  CVPixelBufferRef _pixelBuffer;
  uint8_t* _dataCached;
  bool _isLocked;
};

} // namespace margelo::nitro
