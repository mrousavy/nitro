//
//  GetRuntimeID.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 20.06.24.
//

#pragma once

#include "ThreadUtils.hpp"
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

/**
 * Get an ID for the given Runtime.
 *
 * The ID usually consists of a Runtime description (e.g. "HermesRuntime"),
 * and it's Thread (e.g. "com.facebook.react.runtime.JavaScript")
 */
static inline std::string getRuntimeId(jsi::Runtime& runtime) {
  std::string threadName = ThreadUtils::getThreadName();
  return runtime.description() + std::string(" (") + threadName + std::string(")");
}

} // namespace margelo::nitro
