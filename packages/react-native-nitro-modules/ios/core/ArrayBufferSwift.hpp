//
//  ArrayBufferSwift.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 22.07.24.
//

#pragma once

#include <jsi/jsi.h>

namespace NitroModules { class ArrayBuffer; }
namespace margelo::nitro { class ArrayBufferSwift; }

#include "NitroModules-Swift.h"

namespace margelo::nitro {

using namespace facebook;

/**
 * A C++ based wrapper for `ArrayBuffer` that can be used in JS ArrayBuffers as `jsi::MutableBuffer`.
 */
class ArrayBufferSwift: public jsi::MutableBuffer {
public:
  explicit ArrayBufferSwift(NitroModules::ArrayBuffer swiftPart): _swiftPart(swiftPart) { }
  
public:
  inline NitroModules::ArrayBuffer getSwiftPart() noexcept { return _swiftPart; }
  
public:
  uint8_t* data() override {
    return _swiftPart.getData();
  }

  size_t size() const override {
    NitroModules::ArrayBuffer* swiftPart = const_cast<NitroModules::ArrayBuffer*>(&_swiftPart);
    return swiftPart->getSize();
  }
  
private:
  NitroModules::ArrayBuffer _swiftPart;
};

} // namespace margelo::nitro
