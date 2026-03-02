//
//  JHybridObject.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include "HybridObject.hpp"
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents the Java `HybridObject` class.
 */
class JHybridObject : public jni::JavaClass<JHybridObject> {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/HybridObject;";
};

} // namespace margelo::nitro
