//
//  JSIUtils.h
//  NitroModules
//
//  Created by Marc Rousavy on 20.06.24.
//

#pragma once

#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

static inline std::string getRuntimeId(jsi::Runtime& runtime) {
  return runtime.description();

  // TODO: Do we wanna use address instead of description?
  // uint64_t address = reinterpret_cast<uint64_t>(&runtime);
  // return std::to_string(address);
}

}
