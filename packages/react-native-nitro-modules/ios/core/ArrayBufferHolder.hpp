//
//  ArrayBufferHolder.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.08.24.
//

#pragma once

#include "ArrayBuffer.hpp"
#include "NitroDefines.hpp"
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
class ArrayBufferHolder {
public:
  ArrayBufferHolder(const std::shared_ptr<ArrayBuffer>& arrayBuffer) : _arrayBuffer(arrayBuffer) {}

public:
  /**
   * Create a new `NativeArrayBuffer` that wraps the given data of the given size, without copying it.
   *
   * Once the `ArrayBuffer` is no longer in use, the given `deleteFunc` will be called with the given `deleteFuncContext`
   * as an argument. The caller is responsible for deleting `data` (and `deleteFuncContext`) once this is called.
   */
  static ArrayBufferHolder makeBuffer(uint8_t* data, size_t size, DeleteFn deleteFunc, void* deleteFuncContext) {
    auto arrayBuffer = ArrayBuffer::makeBuffer(data, size, deleteFunc, deleteFuncContext);
    return ArrayBufferHolder(arrayBuffer);
  }

public:
  /**
   * Gets the raw bytes the underlying `ArrayBuffer` points to.
   */
  void* getData() const SWIFT_COMPUTED_PROPERTY {
    return _arrayBuffer->data();
  }
  /**
   * Gets the size of the raw bytes the underlying `ArrayBuffer` points to.
   */
  size_t getSize() const SWIFT_COMPUTED_PROPERTY {
    return _arrayBuffer->size();
  }

  bool isOwner() const SWIFT_COMPUTED_PROPERTY {
    return _arrayBuffer->isOwner();
  }

public:
  inline std::shared_ptr<ArrayBuffer> getArrayBuffer() const {
    return _arrayBuffer;
  }

private:
  std::shared_ptr<ArrayBuffer> _arrayBuffer;
};

} // namespace margelo::nitro
