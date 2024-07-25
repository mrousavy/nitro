//
//  ForeignArrayBuffer.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 25.07.24.
//

#pragma once

#include <jsi/jsi.h>
#include <functional>

namespace margelo::nitro {

using namespace facebook;

using GetDataFn = std::function<uint8_t*()>;
using GetSizeFn = std::function<size_t()>;
using OnDestroyFn = std::function<void()>;

/**
 * Represents a raw byte buffer that can be read from-, and
 * written to- from both JavaScript and C++.
 * `ForeignArrayBuffer` is not thread-safe and does not lock multi-thread access.
 *
 * Also, if `ArrayBuffer` is coming from JS, it is not safe to keep a strong
 * reference on `ArrayBuffer` as C++ does not own the data (`isOwner() == false`) -
 * it can be deleted at any point without C++ knowing about it.
 *
 * It's implementation is considered "foreign" because it uses external functions
 * to fetch it's size and data. Those might come from Java, Swift, or other languages.
 */
class ForeignArrayBuffer: public jsi::MutableBuffer {
public:
  /**
   * Create a new **non-owning**, constant `ArrayBuffer`.
   * The `ArrayBuffer` cannot be kept in memory, as JS owns the data
   * and it can be deleted at any point in time.
   */
  ForeignArrayBuffer(GetDataFn getData,
                     GetSizeFn getSize,
                     OnDestroyFn onDestroy): _getData(getData), _getSize(getSize), _onDestroy(onDestroy) { }
  
  ~ForeignArrayBuffer() {
    _onDestroy();
  }
  
  uint8_t* data() override {
    return _getData();
  }
  
  size_t size() const override {
    return _getSize();
  }
  
private:
  GetDataFn _getData;
  GetSizeFn _getSize;
  OnDestroyFn _onDestroy;
};

} // namespace margelo::nitro
