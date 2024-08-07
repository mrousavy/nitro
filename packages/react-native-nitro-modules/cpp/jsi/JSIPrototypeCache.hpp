//
//  JSICache.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 20.06.24.
//

#pragma once

#include "JSICache.hpp"
#include "OwningReference.hpp"
#include <jsi/jsi.h>
#include <memory>
#include <mutex>
#include <unordered_map>
#include <vector>
#include "HybridObject.hpp"

namespace margelo::nitro {

using namespace facebook;

class JSIPrototypeCache {
public:
  
  static jsi::Object getOrCreatePrototype(const HybridObject& hybridObject);
  
  static jsi::Object createObject(const jsi::Object& prototype);
  
private:
  JSIPrototypeCache() { }
  
};

} // namespace margelo::nitro
