//
//  ArrayBufferHolder.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.08.24.
//

#pragma once

#include "ArrayBuffer.hpp"
#include "NitroDefines.hpp"
#include "PixelBufferArrayBuffer.hpp"
#include "PixelBufferUtils.hpp"
#include "SwiftClosure.hpp"
#include <exception>
#include <memory>

namespace margelo::nitro {

using namespace facebook;

/**
 * Holds instances of `std::shared_ptr<ArrayBuffer>`.
 * The reason this exists is because we cannot directly use `shared_ptr`,
 * nor virtual functions (`jsi::MutableBuffer`) in Swift.
 *
 * Passing around instances of `ArrayBufferHolder` (or `std::shared_ptr<ArrayBuffer>`)
 * does not involve any data copies and is almost zero-overhead - even when passed to JS.
 */
class ArrayBufferHolder final {
public:
  ArrayBufferHolder(const std::shared_ptr<ArrayBuffer>& arrayBuffer) : _arrayBuffer(arrayBuffer) {}

public:
  /**
   * Create a new `NativeArrayBuffer` that wraps the given data of the given size, without copying it.
   *
   * Once the `ArrayBuffer` is no longer in use, the given `deleteFunc` will be called with the given `deleteFuncContext`
   * as an argument. The caller is responsible for deleting `data` once this is called.
   */
  static ArrayBufferHolder wrap(uint8_t* _Nonnull data, size_t size, SwiftClosure destroy) {
    std::function<void()> deleteFunc = destroy.getFunction();
    auto arrayBuffer = ArrayBuffer::wrap(data, size, std::move(deleteFunc));
    return ArrayBufferHolder(arrayBuffer);
  }

  /**
   * Create a new owning `ArrayBuffer` that wraps the given `CVPixelBuffer` without copying
   * pixel data. `pixelBuffer` is passed as an opaque pointer (`CVPixelBufferRef`).
   * Calls `CVPixelBufferRetain` so the buffer outlives this call; requires CPU-readable access.
   *
   * On failure, sets `*outError` and returns a holder with a null buffer.
   * On success, clears `*outError`.
   */
  static ArrayBufferHolder wrapPixelBuffer(void* _Nonnull pixelBuffer, std::exception_ptr* _Nonnull outError) {
    try {
      *outError = nullptr;
      auto* buffer = static_cast<CVPixelBufferRef>(pixelBuffer);
      auto arrayBuffer = std::make_shared<PixelBufferArrayBuffer>(buffer);
      return ArrayBufferHolder(arrayBuffer);
    } catch (...) {
      *outError = std::current_exception();
      return ArrayBufferHolder(std::shared_ptr<ArrayBuffer>{});
    }
  }

  /**
   * Deep-copy the given `CVPixelBuffer` into a new owning pixel-buffer-backed `ArrayBuffer`.
   * `pixelBuffer` is passed as an opaque pointer (`CVPixelBufferRef`).
   *
   * On failure, sets `*outError` and returns a holder with a null buffer.
   * On success, clears `*outError`.
   */
  static ArrayBufferHolder copyPixelBuffer(void* _Nonnull pixelBuffer, std::exception_ptr* _Nonnull outError) {
    try {
      *outError = nullptr;
      auto* source = static_cast<CVPixelBufferRef>(pixelBuffer);
      // copyPixelBuffer gives us ownership; PixelBufferArrayBuffer retains again,
      // so release our copy ownership and leave the ArrayBuffer as the sole owner.
      CVPixelBufferRef copy = PixelBufferUtils::copyPixelBuffer(source);
      auto arrayBuffer = std::make_shared<PixelBufferArrayBuffer>(copy);
      CVPixelBufferRelease(copy);
      return ArrayBufferHolder(arrayBuffer);
    } catch (...) {
      *outError = std::current_exception();
      return ArrayBufferHolder(std::shared_ptr<ArrayBuffer>{});
    }
  }

public:
  /**
   * Gets the raw bytes the underlying `ArrayBuffer` points to.
   */
  uint8_t* _Nonnull getData() const SWIFT_COMPUTED_PROPERTY {
    return _arrayBuffer->data();
  }
  /**
   * Gets the size of the raw bytes the underlying `ArrayBuffer` points to.
   */
  size_t getSize() const SWIFT_COMPUTED_PROPERTY {
    return _arrayBuffer->size();
  }

  /**
   * Whether the underlying `ArrayBuffer` actually owns the data it points to, or not.
   *
   * - If an `ArrayBuffer` owns the data, it is likely an ArrayBuffer created on the native side (C++/Swift).
   *   This means the `ArrayBuffer` is safe to access as long as you have a reference to it, and cannot be deleted otherwise.
   * - If an `ArrayBuffer` doesn't own the data, it is likely an ArrayBuffer coming from JS.
   *   This means the `ArrayBuffer` is **NOT** safe to access outside of the synchronous function's scope.
   *   If you plan on hopping do a different Thread, or storing a long-lived reference to it, make sure to **copy** the data.
   */
  bool getIsOwner() const SWIFT_COMPUTED_PROPERTY {
    return _arrayBuffer->isOwner();
  }

  /**
   * Whether this `ArrayBuffer` is holding a `CVPixelBuffer`.
   */
  bool getIsPixelBuffer() const SWIFT_COMPUTED_PROPERTY {
    return std::dynamic_pointer_cast<PixelBufferArrayBuffer>(_arrayBuffer) != nullptr;
  }

public:
  /**
   * Get the underlying `CVPixelBuffer` as an opaque pointer.
   * Precondition: `isPixelBuffer == true` (check in Swift first).
   * The returned buffer is not additionally retained - lifetime follows this `ArrayBuffer`.
   */
  void* _Nonnull getPixelBufferPointer() const SWIFT_COMPUTED_PROPERTY {
    auto pixelBufferArrayBuffer = std::dynamic_pointer_cast<PixelBufferArrayBuffer>(_arrayBuffer);
    if (pixelBufferArrayBuffer == nullptr) [[unlikely]] {
      throw std::runtime_error("The underlying buffer is not a CVPixelBuffer!");
    }
    return pixelBufferArrayBuffer->getBuffer();
  }

  inline std::shared_ptr<ArrayBuffer> getArrayBuffer() const {
    return _arrayBuffer;
  }

private:
  std::shared_ptr<ArrayBuffer> _arrayBuffer;
};

} // namespace margelo::nitro
