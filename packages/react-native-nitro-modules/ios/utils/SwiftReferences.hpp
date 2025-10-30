//
//  SwiftReferences.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 30.10.25.
//

#pragma once

#include "NitroDefines.hpp"

namespace margelo::nitro {

namespace SwiftReferences {

  /**
   * Increments the ref-count on the unsafe Swift reference by +1.
   * The ref-count needs to be decremented again later to avoid leaks.
   */
  void retainOne(void* NON_NULL ref);
  /**
   * Decrements the ref-count on the unsafe Swift reference by -1.
   * If the ref-count reaches 0, the object will be deallocated.
   */
  void releaseOne(void* NON_NULL ref);

} // namespace SwiftReferences

} // namespace margelo::nitro
