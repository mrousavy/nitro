//
//  BoxedHybridObject.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 17.09.24.
//

#include "BoxedHybridObject.hpp"

namespace margelo::nitro {

jsi::Value BoxedHybridObject::get(jsi::Runtime& runtime, const jsi::PropNameID& propName) {
  std::string name = propName.utf8(runtime);

  if (name == "unbox") {
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, "unbox"), 0,
        [hybridObject = _hybridObject](jsi::Runtime& runtime, const jsi::Value& thisArg, const jsi::Value* args,
                                       size_t count) -> jsi::Value { return hybridObject->toObject(runtime); });
  }

  return jsi::Value::undefined();
}

} // namespace margelo::nitro
