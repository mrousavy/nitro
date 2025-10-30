//
//  MemoryHelper.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 30.10.25.
//

#include "MemoryHelper.hpp"

// Defined in Swift lib core
extern "C" void* _Nonnull swift_retain(void* _Nonnull) noexcept;
extern "C" void swift_release(void* _Nonnull) noexcept;

namespace margelo::nitro {

namespace MemoryHelper {

  void retainOne(void* NON_NULL ref) {
    swift_retain(ref);
  }
  void releaseOne(void* NON_NULL ref) {
    swift_release(ref);
  }

} // namespace MemoryHelper

} // namespace margelo::nitro
