//
//  HybridObjectPrototype.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 07.08.24.
//

#include "HybridObjectPrototype.hpp"

namespace margelo::nitro {

void HybridObjectPrototype::ensureInitialized() {
  std::unique_lock lock(_mutex);
  
  if (!_didLoadMethods) [[unlikely]] {
    // lazy-load all exposed methods
    loadHybridMethods();
    _didLoadMethods = true;
  }
}

jsi::Object HybridObjectPrototype::getPrototype(jsi::Runtime& runtime) {
  ensureInitialized();

  jsi::Object prototype(runtime);
  for (const auto& method : _methods) {
    prototype.setProperty(runtime, method.first.c_str(),
                          jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, method.first),
                                                                method.second.parameterCount, method.second.function));
  }

  jsi::Object objectConstructor = runtime.global().getPropertyAsObject(runtime, "Object");
  jsi::Function defineProperty = objectConstructor.getPropertyAsFunction(runtime, "defineProperty");
  for (const auto& getter : _getters) {
    jsi::Object property(runtime);
    property.setProperty(runtime, "configurable", false);
    property.setProperty(runtime, "enumerable", true);
    property.setProperty(runtime, "get",
                         jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, "get"), 0, getter.second));

    const auto& setter = _setters.find(getter.first);
    if (setter != _setters.end()) {
      // there also is a setter for this property!
      property.setProperty(runtime, "set",
                           jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, "set"), 1, setter->second));
    }

    property.setProperty(runtime, "name", jsi::String::createFromUtf8(runtime, getter.first.c_str()));
    defineProperty.call(runtime,
                        /* obj */ prototype,
                        /* propName */ jsi::String::createFromUtf8(runtime, getter.first.c_str()),
                        /* descriptorObj */ property);
  }
  return prototype;
}

}
