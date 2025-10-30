//
//  SwiftReferences.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 30.10.25.
//

#include "SwiftReferences.hpp"

// Defined in Swift lib core
extern "C" void* _Nonnull swift_retain(void* _Nonnull) noexcept;
extern "C" void swift_release(void* _Nonnull) noexcept;

namespace margelo::nitro {

namespace SwiftReferences {

  void retainOne(void* NON_NULL ref) {
    swift_retain(ref);
  }
  void releaseOne(void* NON_NULL ref) {
    swift_release(ref);
  }

} // namespace SwiftReferences

} // namespace margelo::nitro
