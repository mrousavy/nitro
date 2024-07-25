//
//  DataArrayBuffer.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 25.07.24.
//

#include "DataArrayBuffer.hpp"

#if __has_include("NitroModules-Swift.h")

namespace margelo::nitro {

DataArrayBuffer::DataArrayBuffer(NitroModules::DataBasedArrayBuffer swiftPart): _swiftPart(swiftPart) { }

size_t DataArrayBuffer::size() const {
  auto swiftPart = const_cast<NitroModules::DataBasedArrayBuffer*>(&_swiftPart);
  return swiftPart->getSize();
}

uint8_t* DataArrayBuffer::data() {
  const void* bytes = _swiftPart.getBytes();
  return static_cast<uint8_t*>(const_cast<void*>(bytes));
}

} // namespace margelo::nitro

#endif
