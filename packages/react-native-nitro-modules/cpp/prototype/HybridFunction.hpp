//
//  PrototypeChain.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 07.08.24.
//

#pragma once

#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

/**
 * Wraps a JSI Host Function with additional information (like `parameterCount`).
 */
struct HybridFunction {
public:
  jsi::HostFunctionType function;
  size_t parameterCount;

public:
  jsi::Function toJS(jsi::Runtime& runtime, const char* name) const {
    return jsi::Function::createFromHostFunction(runtime,
                                                 jsi::PropNameID::forUtf8(runtime, name),
                                                 parameterCount,
                                                 function);
  }
};

} // namespace margelo::nitro
