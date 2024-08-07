//
//  HybridObjectPrototype.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 07.08.24.
//

#include "HybridObjectPrototype.hpp"
#include "NitroLogger.hpp"

namespace margelo::nitro {

std::unordered_map<jsi::Runtime*, HybridObjectPrototype::PrototypeCache> HybridObjectPrototype::_prototypeCache;

void HybridObjectPrototype::ensureInitialized() {
  std::unique_lock lock(_mutex);
  
  if (!_didLoadMethods) [[unlikely]] {
    // lazy-load all exposed methods
    loadHybridMethods();
    _didLoadMethods = true;
  }
}

jsi::Object HybridObjectPrototype::createPrototype(jsi::Runtime& runtime, Prototype* prototype) {
  if (prototype == nullptr) {
    // There is no prototype - we just have an empty base.
    return jsi::Object(runtime);
  }
  auto& prototypeCache = _prototypeCache[&runtime];
  auto cachedPrototype = prototypeCache.find(prototype->instanceTypeId);
  if (cachedPrototype != prototypeCache.end()) {
    Logger::log(TAG, "Re-using prototype \"%s\" from cache...", prototype->instanceTypeId.name());
    OwningReference<jsi::Object>& cachedObject = cachedPrototype->second;
    return jsi::Value(runtime, *cachedObject).getObject(runtime);
  }
  
  Logger::log(TAG, "Creating new prototype for C++ instance type \"%s\"...", prototype->instanceTypeId.name());
  
  // 0. Get some helper JS methods from global
  jsi::Object objectConstructor = runtime.global().getPropertyAsObject(runtime, "Object");
  jsi::Function objectCreate = objectConstructor.getPropertyAsFunction(runtime, "create");
  jsi::Function objectDefineProperty = objectConstructor.getPropertyAsFunction(runtime, "defineProperty");
  
  // 1. Create an empty JS Object, inheriting from the base prototype
  jsi::Object object = objectCreate.call(runtime, createPrototype(runtime, prototype->child)).getObject(runtime);
  
  // 2. Add all Hybrid Methods to it
  for (const auto& method : prototype->methods) {
    object.setProperty(runtime, method.first.c_str(),
                          jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, method.first),
                                                                method.second.parameterCount, method.second.function));
  }

  // 3. Add all properties (getter + setter) to it using defineProperty
  for (const auto& getter : prototype->getters) {
    jsi::Object property(runtime);
    property.setProperty(runtime, "configurable", false);
    property.setProperty(runtime, "enumerable", true);
    property.setProperty(runtime, "get", getter.second.toJS(runtime, "get"));

    const auto& setter = prototype->setters.find(getter.first);
    if (setter != prototype->setters.end()) {
      // there also is a setter for this property!
      property.setProperty(runtime, "set", setter->second.toJS(runtime, "set"));
    }

    property.setProperty(runtime, "name", jsi::String::createFromUtf8(runtime, getter.first.c_str()));
    objectDefineProperty.call(runtime,
                              /* obj */ object,
                              /* propName */ jsi::String::createFromUtf8(runtime, getter.first.c_str()),
                              /* descriptorObj */ property);
  }
  
  // 4. Throw it into our cache
  JSICacheReference jsiCache = JSICache::getOrCreateCache(runtime);
  OwningReference<jsi::Object> cachedObject = jsiCache.makeShared(std::move(object));
  prototypeCache.emplace(prototype->instanceTypeId, cachedObject);
  
  // 5. Return it!
  return jsi::Value(runtime, *cachedObject).getObject(runtime);
}

jsi::Object HybridObjectPrototype::getPrototype(jsi::Runtime& runtime) {
  ensureInitialized();
  
  return createPrototype(runtime, _prototype);
}

}
