//
//  MutableBufferNativeState.hpp
//  react-native-nitro
//
//  This NativeState type is implemented in a .cpp file (not header-only) so that
//  its type identity lives in a single place: libNitroModules.
//
//  Why that matters: on Android, each shared library (.so) is loaded with
//  RTLD_LOCAL. If another Nitro module does `dynamic_pointer_cast` to
//  MutableBufferNativeState, the cast can fail even when the object really is
//  that type — the two .so files each see a different typeinfo.
//
//  Call tryGetArrayBufferFromNativeState() instead. That helper runs inside
//  libNitroModules and performs the cast there, where RTTI is consistent.
//

#pragma once

#include <jsi/jsi.h>
#include <memory>

namespace margelo::nitro {

using namespace facebook;

class ArrayBuffer;

struct MutableBufferNativeState final : public jsi::NativeState {
public:
  explicit MutableBufferNativeState(const std::shared_ptr<jsi::MutableBuffer>& buffer);
  ~MutableBufferNativeState() override;

  std::shared_ptr<jsi::MutableBuffer> buffer;
};

/**
 * Cast NativeState → ArrayBuffer inside libNitroModules (single RTTI domain).
 * Returns nullptr if `state` is not a MutableBufferNativeState holding an ArrayBuffer.
 */
std::shared_ptr<ArrayBuffer> tryGetArrayBufferFromNativeState(
    const std::shared_ptr<jsi::NativeState>& state);

} // namespace margelo::nitro
