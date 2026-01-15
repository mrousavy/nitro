//
//  SwiftClassWrapper.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 15.01.26.
//

#pragma once

#include "NitroDefines.hpp"

namespace margelo::nitro {

/**
 * Represents a C++ wrapper for a Swift class.
 *
 * Swift inheritance is specifically **not** reflected through
 * this C++ class, neither through the Swift class pointer it holds.
 * Instead, it holds a pointer to a Swift class, which itself holds
 * a reference to another Swift class (or protocol) - this Swift
 * class/protocol is allowed to have inheritance.
 */
class SwiftClassWrapper {
public:
  virtual void* NON_NULL getSwiftPartUnretained() noexcept = 0;
};

} // namespace margelo::nitro
