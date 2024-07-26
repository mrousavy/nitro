//
//  ArrayBuffer.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include <jsi/jsi.h>
#include <functional>

namespace margelo::nitro {

using namespace facebook;

using DeleteFn = std::function<void(uint8_t*)>;

static DeleteFn defaultDeleteFn = [](uint8_t* buffer) {
  delete[] buffer;
};


/**
 * Represents a raw byte buffer that can be read from-, and
 * written to- from both JavaScript and C++.
 * `ArrayBuffer` is not thread-safe and does not lock multi-thread access.
 *
 * Also, if `ArrayBuffer` is coming from JS, it is not safe to keep a strong
 * reference on `ArrayBuffer` as C++ does not own the data (`isOwner() == false`) -
 * it can be deleted at any point without C++ knowing about it.
 *
 * Only if C++ creates the `ArrayBuffer` a reference to it can be safely
 * kept in memory, as C++ is then the owner of `ArrayBuffer` (`isOwner() == true`).
 */
class ArrayBuffer: public jsi::MutableBuffer {
public:
  /**
   * Create a new **owning** `ArrayBuffer`.
   * The `ArrayBuffer` can be kept in memory, as C++ owns the data
   * and will only delete it once this `ArrayBuffer` gets deleted
   */
  ArrayBuffer(uint8_t* data, size_t size, DeleteFn&& deleteFunc): _data(data), _size(size), _deleteFunc(std::move(deleteFunc)) { }
  /**
   * Create a new `ArrayBuffer`.
   * If `destroyOnDeletion` is `true`, the `ArrayBuffer` is **owning**, otherwise it is **non-owning**.
   * The `ArrayBuffer` can only be safely kept in memory if it is owning (`isOwning()`).
   */
  ArrayBuffer(uint8_t* data, size_t size, bool destroyOnDeletion): _data(data), _size(size) {
    _deleteFunc = destroyOnDeletion ? defaultDeleteFn : nullptr;
  }
  
  // ArrayBuffer cannot be copied
  ArrayBuffer(const ArrayBuffer&) = delete;
  // ArrayBuffer cannot be moved
  ArrayBuffer(ArrayBuffer&&) = delete;
  
  ~ArrayBuffer() {
    if (_deleteFunc != nullptr) {
      _deleteFunc(_data);
    }
  }
  
  uint8_t* data() noexcept override {
    return _data;
  }
  
  size_t size() const noexcept override {
    return _size;
  }
  
  bool isOwner() const noexcept {
    return _deleteFunc != nullptr;
  }
  
private:
  uint8_t* _data;
  size_t _size;
  DeleteFn _deleteFunc;
};

} // namespace margelo::nitro
