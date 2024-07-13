//
//  ArrayBuffer.hpp
//  Pods
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include <jsi/jsi.h>

namespace margelo {

using namespace facebook;

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
