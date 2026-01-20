//
//  SwiftConverter+ArrayBuffer.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 16.01.26.
//

#include "SwiftConverter+ArrayBuffer.hpp"
#include "SwiftConverter.hpp"
#include <NitroModules/NitroModules-Swift-Cxx-Umbrella.hpp>

namespace margelo::nitro {

std::shared_ptr<ArrayBuffer> fromSwift(ArrayBufferHolder& swiftArrayBuffer) {
  return swiftArrayBuffer.getArrayBuffer();
}

ArrayBufferHolder toSwift(const std::shared_ptr<ArrayBuffer>& cppArrayBuffer) {
  return ArrayBufferHolder(cppArrayBuffer);
}

}
