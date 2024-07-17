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
   * The `ArrayBuffer` can be kept in memory, as C++ owns the data.
   * Inside `deleter`, the `data` should be deleted.
   */
  explicit ArrayBuffer(uint8_t* data, size_t size, std::function<void()>&& deleter)
    : _data(data), _size(size), _deleter(std::move(deleter)) { }
  
  /**
   * Create a new **non-owning** `ArrayBuffer`.
   * The `ArrayBuffer` cannot be kept in memory, as JS owns the data
   * and it can be deleted at any point in time.
   */
  ArrayBuffer(uint8_t* data, size_t size): _data(data), _size(size), _deleter(nullptr) { }
  /**
   * `ArrayBuffer` cannot be copied.
   */
  ArrayBuffer(const ArrayBuffer&) = delete;
  /**
   * `ArrayBuffer` cannot be moved.
   */
  ArrayBuffer(ArrayBuffer&&) = delete;
  
  ~ArrayBuffer() {
    if (_deleter != nullptr) {
      _deleter();
    }
  }

  uint8_t* data() override {
    return _data;
  }

  size_t size() const override {
    return _size;
  }
  
  /**
   * Returns whether this `ArrayBuffer` is actually owning the data,
   * or just borrowing it.
   *
   * If this `ArrayBuffer` is just borrowing the data (`isOwner() == false`), it is unsafe to keep
   * a strong reference on this `ArrayBuffer`, as the data might be deleted at any point.
   *
   * If this `ArrayBuffer` is actually owning the data (`isOwner() == true`), it is safe to
   * keep a reference to the `ArrayBuffer` in memory, as the data will stay alive as long as
   * the `ArrayBuffer` is still alive.
   */
  bool isOwner() const {
    return _deleter != nullptr;
  }

private:
  uint8_t* _data;
  size_t _size;
  std::function<void()> _deleter;
};

}
