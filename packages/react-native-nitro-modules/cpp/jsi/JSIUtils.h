//
//  JSIUtils.h
//  NitroModules
//
//  Created by Marc Rousavy on 20.06.24.
//

#pragma once

#include <jsi/jsi.h>
#include "ThreadUtils.hpp"

namespace margelo::nitro {

using namespace facebook;

static inline std::string getRuntimeId(jsi::Runtime& runtime) {
  std::string threadName = ThreadUtils::getThreadName();
  return runtime.description() + std::string(" (") + threadName + std::string(")");
}

}
