//
//  SwiftConverter+ArrayBuffer.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 16.01.26.
//

#pragma once

#include "NitroDefines.hpp"
#include "ArrayBuffer.hpp"
#include "ArrayBufferHolder.hpp"
#include <memory>

namespace margelo::nitro {
template <typename T, typename Enable>
struct SwiftConverter;
}

namespace margelo::nitro {

template <>
struct SwiftConverter<std::shared_ptr<ArrayBuffer>, void> final {
  using SwiftType = ArrayBufferHolder;
  static std::shared_ptr<ArrayBuffer> fromSwift(ArrayBufferHolder& swiftArrayBuffer);
  static ArrayBufferHolder toSwift(const std::shared_ptr<ArrayBuffer>& cppArrayBuffer);
};

}
