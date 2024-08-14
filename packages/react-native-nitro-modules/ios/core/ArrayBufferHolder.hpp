//
//  ArrayBufferHolder.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.08.24.
//

#pragma once

#include "ArrayBuffer.hpp"
#include <memory>

namespace margelo::nitro {

using namespace facebook;

class ArrayBufferHolder {
public:
  ArrayBufferHolder(const std::shared_ptr<ArrayBuffer>& arrayBuffer): _arrayBuffer(arrayBuffer) { }
  
public:
  /**
   * Create a new `NativeArrayBuffer` that wraps the given data of the given size, without copying it.
   *
   * Once the `ArrayBuffer` is no longer in use, the given `deleteFunc` will be called with the given `deleteFuncContext`
   * as an argument. The caller is responsible for deleting `data` (and `deleteFuncContext`) once this is called.
   */
  static ArrayBufferHolder makeBuffer(uint8_t* data, size_t size, DeleteFn deleteFunc, void* deleteFuncContext) {
    auto arrayBuffer = std::make_shared<NativeArrayBuffer>(data, size, deleteFunc, deleteFuncContext);
    return ArrayBufferHolder(arrayBuffer);
  }
  
public:
  inline std::shared_ptr<ArrayBuffer> getArrayBuffer() const { return _arrayBuffer; }

private:
  std::shared_ptr<ArrayBuffer> _arrayBuffer;
};

} // namespace margelo::nitro
