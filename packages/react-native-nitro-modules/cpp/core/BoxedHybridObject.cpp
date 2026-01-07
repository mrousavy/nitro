//
//  BoxedHybridObject.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 17.09.24.
//

#include "BoxedHybridObject.hpp"
#include "PropNameIDCache.hpp"

namespace margelo::nitro {

std::vector<jsi::PropNameID> BoxedHybridObject::getPropertyNames(facebook::jsi::Runtime& runtime) {
  return jsi::PropNameID::names(runtime, "unbox");
}

jsi::Value BoxedHybridObject::get(jsi::Runtime& runtime, const jsi::PropNameID& propName) {
  std::string name = propName.utf8(runtime);

  if (name == "unbox") {
    return jsi::Function::createFromHostFunction(
        runtime, PropNameIDCache::get(runtime, "unbox"), 0,
        [hybridObject = _hybridObject](jsi::Runtime& runtime, const jsi::Value&, const jsi::Value*, size_t) -> jsi::Value {
          return hybridObject->toObject(runtime);
        });
  }

  return jsi::Value::undefined();
}

} // namespace margelo::nitro
