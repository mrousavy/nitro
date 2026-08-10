//
//  PixelBufferUtils.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 09.08.26.
//

#pragma once

#include <CoreVideo/CVPixelBuffer.h>
#include <cstddef>

namespace margelo::nitro {

/**
 * Helpers for sizing and deep-copying `CVPixelBuffer` instances used by
 * `PixelBufferArrayBuffer`.
 */
class PixelBufferUtils final {
public:
  PixelBufferUtils() = delete;

  /**
   * Returns the total size in **bytes** of the given pixel buffer.
   *
   * - Non-planar: `bytesPerRow * height`
   * - Planar: sum of `bytesPerRowOfPlane(i) * heightOfPlane(i)` for each plane
   *
   * Note: Planar buffers are **not** a single contiguous byte region.
   * `PixelBufferArrayBuffer::data()` throws for planar formats; use
   * `getPixelBuffer()` for zero-copy GPU / multi-plane access.
   */
  static size_t getPixelBufferSize(CVPixelBufferRef pixelBuffer);

  /**
   * Deep-copies `source` into a newly allocated `CVPixelBuffer` of the same
   * dimensions and pixel format. The caller owns the result and must
   * `CVPixelBufferRelease` it (or pass it to `PixelBufferArrayBuffer`, which
   * retains and later releases).
   */
  static CVPixelBufferRef copyPixelBuffer(CVPixelBufferRef source);
};

} // namespace margelo::nitro
