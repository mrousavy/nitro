//
//  MutableBufferNativeState.cpp
//  react-native-nitro
//

#include "MutableBufferNativeState.hpp"
#include "ArrayBuffer.hpp"

namespace margelo::nitro {

MutableBufferNativeState::MutableBufferNativeState(
    const std::shared_ptr<jsi::MutableBuffer>& buffer)
    : buffer(buffer) {}

MutableBufferNativeState::~MutableBufferNativeState() = default;

std::shared_ptr<ArrayBuffer> tryGetArrayBufferFromNativeState(
    const std::shared_ptr<jsi::NativeState>& state) {
  auto holder = std::dynamic_pointer_cast<MutableBufferNativeState>(state);
  if (holder == nullptr) {
    return nullptr;
  }
  return std::dynamic_pointer_cast<ArrayBuffer>(holder->buffer);
}

} // namespace margelo::nitro
