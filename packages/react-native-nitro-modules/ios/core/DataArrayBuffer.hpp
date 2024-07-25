//
//  DataArrayBuffer.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 25.07.24.
//

#pragma once

#include <jsi/jsi.h>

#if __has_include("NitroModules-Swift.h")
#include "NitroModules-Swift.h"

namespace margelo::nitro {

using namespace facebook;

class DataArrayBuffer: public jsi::MutableBuffer {
public:
  explicit DataArrayBuffer(NitroModules::DataBasedArrayBuffer swiftPart);
  
public:
  size_t size() const;
  uint8_t* data();
  
private:
  NitroModules::DataBasedArrayBuffer _swiftPart;
};

} // namespace margelo::nitro

#endif
