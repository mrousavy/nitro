//
// Created by Marc Rousavy on 21.02.24.
//

#include "HybridObject.hpp"
#include "JSIConverter.hpp"
#include "NitroDefines.hpp"

namespace margelo::nitro {

HybridObject::HybridObject(const char* name) : HybridObjectPrototype(), _name(name) {}
HybridObject::~HybridObject() {}

std::string HybridObject::toString() {
  return "[HybridObject " + std::string(_name) + "]";
}

std::string HybridObject::getName() {
  return _name;
}

bool HybridObject::equals(std::shared_ptr<HybridObject> other) {
  return this == other.get();
}

jsi::Value HybridObject::disposeRaw(jsi::Runtime& runtime, const jsi::Value& thisArg, const jsi::Value*, size_t) {
  // 1. Dispose any resources - this might be overridden by child classes to perform manual cleanup.
  dispose();
  // 2. Remove the NativeState from `this`
  jsi::Object thisObject = thisArg.asObject(runtime);
  thisObject.setNativeState(runtime, nullptr);

  return jsi::Value::undefined();
}

void HybridObject::loadHybridMethods() {
  registerHybrids(this, [](Prototype& prototype) {
    prototype.registerHybridGetter("name", &HybridObject::getName);
    prototype.registerHybridMethod("equals", &HybridObject::equals);
    prototype.registerHybridMethod("toString", &HybridObject::toString);
    prototype.registerRawHybridMethod("dispose", 0, &HybridObject::disposeRaw);
  });
}

jsi::Value HybridObject::toObject(jsi::Runtime& runtime) {
  // 1. Check if we have a jsi::WeakObject in cache that we can use to avoid re-creating the object each time
  auto cachedObject = _objectCache.find(&runtime);
  if (cachedObject != _objectCache.end()) {
    // 1.1. We have a WeakObject, try to see if it is still alive
    OwningLock<jsi::WeakObject> lock = cachedObject->second.lock();
    jsi::Value object = cachedObject->second->lock(runtime);
    if (!object.isUndefined()) {
      // 1.2. It is still alive - we can use it instead of creating a new one!
      return object;
    }
  }

  // 2. Get the object's base prototype (global & shared)
  jsi::Value prototype = getPrototype(runtime);

  // 3. Get the global JS Object.create(...) constructor so we can create an object from the given prototype
  jsi::Object objectConstructor = runtime.global().getPropertyAsObject(runtime, "Object");
  jsi::Function create = objectConstructor.getPropertyAsFunction(runtime, "create");

  // 4. Create the object using Object.create(...)
  jsi::Object object = create.call(runtime, prototype).asObject(runtime);

  // 5. Assign NativeState to the object so the prototype can resolve the native methods
  object.setNativeState(runtime, shared_from_this());

  // 6. Set memory size so Hermes GC knows about actual memory
  object.setExternalMemoryPressure(runtime, getExternalMemorySize());

#ifdef NITRO_DEBUG
  // 7. Assign a private __type property for debugging - this will be used so users know it's not just an empty object.
  object.setProperty(runtime, "__type", jsi::String::createFromUtf8(runtime, "NativeState<" + std::string(_name) + ">"));
#endif

  // 8. Throw a jsi::WeakObject pointing to our object into cache so subsequent calls can use it from cache
  JSICacheReference cache = JSICache::getOrCreateCache(runtime);
  _objectCache.emplace(&runtime, cache.makeShared(jsi::WeakObject(runtime, object)));

  // 9. Return it!
  return object;
}

} // namespace margelo::nitro
