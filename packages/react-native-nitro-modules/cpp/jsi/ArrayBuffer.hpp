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
   * Create a new **non-owning**, constant `ArrayBuffer`.
   * The `ArrayBuffer` cannot be kept in memory, as JS owns the data
   * and it can be deleted at any point in time.
   */
  ArrayBuffer(uint8_t* data, size_t size): _data(data), _size(size), _deleteFunc(nullptr) { }
  /**
   * Create a new **owning** `ArrayBuffer`.
   * The `ArrayBuffer` can be kept in memory, as C++ owns the data
   * and will only delete it once this `ArrayBuffer` gets deleted
   */
  ArrayBuffer(uint8_t* data, size_t size, DeleteFn&& deleteFunc): _data(data), _size(size), _deleteFunc(std::move(deleteFunc)) { }
  /**
   * Create a new **owning** `ArrayBuffer`.
   * The `ArrayBuffer` can be kept in memory, as C++ owns the data
   * and will only delete it once this `ArrayBuffer` gets deleted
   */
  ArrayBuffer(uint8_t* data, size_t size, bool destroyOnDeletion = true): _data(data), _size(size) {
    _deleteFunc = [](uint8_t* buffer) {
      delete[] buffer;
    };
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
  
  uint8_t* data() override {
    return _data;
  }
  
  size_t size() const override {
    return _size;
  }
  
private:
  uint8_t* _data;
  size_t _size;
  DeleteFn _deleteFunc;
};

} // namespace margelo::nitro
