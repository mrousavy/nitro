//
//  PixelBufferUtils.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 09.08.26.
//

#include "PixelBufferUtils.hpp"
#include <algorithm>
#include <cstdint>
#include <cstring>
#include <stdexcept>
#include <string>

namespace margelo::nitro {

size_t PixelBufferUtils::getPixelBufferSize(CVPixelBufferRef pixelBuffer) {
  if (pixelBuffer == nullptr) [[unlikely]] {
    throw std::runtime_error("Cannot get size of a null CVPixelBuffer!");
  }

  const size_t planeCount = CVPixelBufferGetPlaneCount(pixelBuffer);
  if (planeCount == 0) {
    // Non-planar (e.g. BGRA): one contiguous region with possible row padding.
    return CVPixelBufferGetBytesPerRow(pixelBuffer) * CVPixelBufferGetHeight(pixelBuffer);
  }

  // Planar (e.g. 420YpCbCr8BiPlanar): sum of plane byte sizes.
  // This is a logical size for `ArrayBuffer.byteLength` - the planes are not
  // guaranteed to form one contiguous `data()` region.
  size_t total = 0;
  for (size_t plane = 0; plane < planeCount; plane++) {
    total += CVPixelBufferGetBytesPerRowOfPlane(pixelBuffer, plane) * CVPixelBufferGetHeightOfPlane(pixelBuffer, plane);
  }
  return total;
}

static void copyLockedPixelBufferContents(CVPixelBufferRef source, CVPixelBufferRef destination) {
  const size_t planeCount = CVPixelBufferGetPlaneCount(source);
  if (planeCount == 0) {
    const size_t height = CVPixelBufferGetHeight(source);
    const size_t srcStride = CVPixelBufferGetBytesPerRow(source);
    const size_t dstStride = CVPixelBufferGetBytesPerRow(destination);
    const size_t widthBytes = std::min(srcStride, dstStride);
    auto* src = static_cast<const uint8_t*>(CVPixelBufferGetBaseAddress(source));
    auto* dst = static_cast<uint8_t*>(CVPixelBufferGetBaseAddress(destination));
    if (src == nullptr || dst == nullptr) [[unlikely]] {
      throw std::runtime_error("Failed to get base address while copying CVPixelBuffer!");
    }
    for (size_t row = 0; row < height; row++) {
      std::memcpy(dst + row * dstStride, src + row * srcStride, widthBytes);
    }
    return;
  }

  for (size_t plane = 0; plane < planeCount; plane++) {
    const size_t height = CVPixelBufferGetHeightOfPlane(source, plane);
    const size_t srcStride = CVPixelBufferGetBytesPerRowOfPlane(source, plane);
    const size_t dstStride = CVPixelBufferGetBytesPerRowOfPlane(destination, plane);
    const size_t widthBytes = std::min(srcStride, dstStride);
    auto* src = static_cast<const uint8_t*>(CVPixelBufferGetBaseAddressOfPlane(source, plane));
    auto* dst = static_cast<uint8_t*>(CVPixelBufferGetBaseAddressOfPlane(destination, plane));
    if (src == nullptr || dst == nullptr) [[unlikely]] {
      throw std::runtime_error("Failed to get plane base address while copying CVPixelBuffer!");
    }
    for (size_t row = 0; row < height; row++) {
      std::memcpy(dst + row * dstStride, src + row * srcStride, widthBytes);
    }
  }
}

CVPixelBufferRef PixelBufferUtils::copyPixelBuffer(CVPixelBufferRef source) {
  if (source == nullptr) [[unlikely]] {
    throw std::runtime_error("Cannot copy a null CVPixelBuffer!");
  }

  const size_t width = CVPixelBufferGetWidth(source);
  const size_t height = CVPixelBufferGetHeight(source);
  const OSType pixelFormat = CVPixelBufferGetPixelFormatType(source);

  CVPixelBufferRef destination = nullptr;
  const CVReturn createResult = CVPixelBufferCreate(kCFAllocatorDefault, width, height, pixelFormat, nullptr, &destination);
  if (createResult != kCVReturnSuccess || destination == nullptr) [[unlikely]] {
    throw std::runtime_error("Failed to create CVPixelBuffer copy! CVReturn: " + std::to_string(createResult));
  }

  const CVReturn lockSource = CVPixelBufferLockBaseAddress(source, kCVPixelBufferLock_ReadOnly);
  if (lockSource != kCVReturnSuccess) [[unlikely]] {
    CVPixelBufferRelease(destination);
    throw std::runtime_error("Failed to lock source CVPixelBuffer for copy! CVReturn: " + std::to_string(lockSource));
  }
  const CVReturn lockDestination = CVPixelBufferLockBaseAddress(destination, 0);
  if (lockDestination != kCVReturnSuccess) [[unlikely]] {
    CVPixelBufferUnlockBaseAddress(source, kCVPixelBufferLock_ReadOnly);
    CVPixelBufferRelease(destination);
    throw std::runtime_error("Failed to lock destination CVPixelBuffer for copy! CVReturn: " + std::to_string(lockDestination));
  }

  try {
    copyLockedPixelBufferContents(source, destination);
  } catch (...) {
    CVPixelBufferUnlockBaseAddress(source, kCVPixelBufferLock_ReadOnly);
    CVPixelBufferUnlockBaseAddress(destination, 0);
    CVPixelBufferRelease(destination);
    throw;
  }

  CVPixelBufferUnlockBaseAddress(source, kCVPixelBufferLock_ReadOnly);
  CVPixelBufferUnlockBaseAddress(destination, 0);
  return destination;
}

} // namespace margelo::nitro
