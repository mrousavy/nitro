//
//  HybridObjectPrototype.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 07.08.24.
//

#include "HybridObjectPrototype.hpp"
#include "NitroDefines.hpp"
#include "NitroLogger.hpp"
#include "NitroTypeInfo.hpp"
#include "ObjectUtils.hpp"

namespace margelo::nitro {

std::unordered_map<jsi::Runtime*, HybridObjectPrototype::PrototypeCache> HybridObjectPrototype::_prototypeCache;

jsi::Value HybridObjectPrototype::createPrototype(jsi::Runtime& runtime, const std::shared_ptr<Prototype>& prototype) {
  // 0. Check if we're at the highest level of our prototype chain
  if (prototype == nullptr) {
    // There is no prototype - we just have an empty Object base - so `Object.create({})`
    return jsi::Object(runtime);
  }

  // 1. Try looking for the given prototype in cache.
  //    If we find it in cache, we can create instances faster and skip creating the prototype from scratch!
  auto& prototypeCache = _prototypeCache[&runtime];
  auto cachedPrototype = prototypeCache.find(prototype->getNativeInstanceId());
  if (cachedPrototype != prototypeCache.end()) {
    const BorrowingReference<jsi::Object>& cachedObject = cachedPrototype->second;
    if (cachedObject != nullptr) {
      // 1.1. Found it in cache! Copy & return it.
      return jsi::Value(runtime, *cachedObject);
    }
  }

  // 2. Get the base prototype of this prototype (recursively), then create the individual prototypes downwards
  //    until we reach our current prototype.
  std::string typeName = TypeInfo::getFriendlyTypename(prototype->getNativeInstanceId(), true);
  Logger::log(LogLevel::Info, TAG, "Creating new JS prototype for C++ instance type \"%s\"...", typeName.c_str());
  jsi::Value basePrototype = createPrototype(runtime, prototype->getBase());
  jsi::Object object = ObjectUtils::create(runtime, basePrototype);

  // 4. Add all Hybrid Methods to it
  for (const auto& method : prototype->getMethods()) {
    // method()
    const std::string& name = method.first;
    ObjectUtils::defineProperty(runtime, object, name.c_str(),
                                PlainPropertyDescriptor{
                                    .configurable = false,
                                    .enumerable = true,
                                    .value = method.second.toJSFunction(runtime),
                                    .writable = false,
                                });
  }

  // 5. Add all properties (getter + setter) to it using defineProperty
  for (const auto& getter : prototype->getGetters()) {
    const auto& setter = prototype->getSetters().find(getter.first);
    bool isReadonly = setter == prototype->getSetters().end();
    const std::string& name = getter.first;
    if (isReadonly) {
      // get
      ObjectUtils::defineProperty(runtime, object, name.c_str(),
                                  ComputedReadonlyPropertyDescriptor{// readonly
                                                                     .configurable = false,
                                                                     .enumerable = true,
                                                                     .get = getter.second.toJSFunction(runtime)});
    } else {
      // get + set
      ObjectUtils::defineProperty(runtime, object, name.c_str(),
                                  ComputedPropertyDescriptor{// readonly with setter
                                                             .configurable = false,
                                                             .enumerable = false,
                                                             .get = getter.second.toJSFunction(runtime),
                                                             .set = setter->second.toJSFunction(runtime)});
    }
  }

  // 6. In DEBUG, add a __type info to the prototype object.
#ifdef NITRO_DEBUG
  std::string prototypeName = "Prototype<" + typeName + ">";
  ObjectUtils::defineProperty(runtime, object, "__type",
                              PlainPropertyDescriptor{
                                  .configurable = false,
                                  .enumerable = true,
                                  .value = jsi::String::createFromUtf8(runtime, prototypeName),
                                  .writable = false,
                              });
#endif

  // 7. In DEBUG, freeze the prototype.
#ifdef NITRO_DEBUG
  ObjectUtils::freeze(runtime, object);
#endif

  // 8. Throw it into our cache so the next lookup can be cached and therefore faster
  JSICacheReference jsiCache = JSICache::getOrCreateCache(runtime);
  BorrowingReference<jsi::Object> sharedObject = jsiCache.makeShared(std::move(object));
  auto instanceId = prototype->getNativeInstanceId();
  prototypeCache[instanceId] = sharedObject;

  // 9. Return it!
  return jsi::Value(runtime, *sharedObject);
}

jsi::Value HybridObjectPrototype::getPrototype(jsi::Runtime& runtime) {
  ensureInitialized();

  return createPrototype(runtime, _prototypeChain.getPrototype());
}

} // namespace margelo::nitro
