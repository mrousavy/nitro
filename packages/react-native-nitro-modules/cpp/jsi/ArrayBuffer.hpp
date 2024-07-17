//
//  ArrayBuffer.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents a raw byte buffer that can be read from-, and
 * written to- from both JavaScript and C++.
 * `ArrayBuffer` is not thread-safe and does not lock multi-thread access.
 */
class ArrayBuffer: public jsi::MutableBuffer {
public:
  explicit ArrayBuffer(uint8_t* data, size_t size): _data(data), _size(size) { }

  uint8_t* data() override {
    return _data;
  }

  size_t size() const override {
    return _size;
  }

private:
  uint8_t* _data;
  size_t _size;
};

}
