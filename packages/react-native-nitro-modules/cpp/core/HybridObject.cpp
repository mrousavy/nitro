//
// Created by Marc Rousavy on 21.02.24.
//

#include "HybridObject.hpp"
#include "HybridContext.hpp"
#include "JSIConverter.hpp"
#include "NitroLogger.hpp"

#define LOG_MEMORY_ALLOCATIONS false

namespace margelo::nitro {

#if LOG_MEMORY_ALLOCATIONS
static std::mutex _instanceCounterMutex;
static std::unordered_map<const char*, uint32_t> _aliveInstances;
static std::unordered_map<const char*, int> _instanceIds;

static uint32_t incrementAliveInstancesAndGet(const char* name) {
  std::unique_lock lock(_instanceCounterMutex);
  return ++_aliveInstances[name];
}

static uint32_t decrementAliveInstancesAndGet(const char* name) {
  std::unique_lock lock(_instanceCounterMutex);
  return --_aliveInstances[name];
}

static uint32_t getTotalAliveInstances() {
  std::unique_lock lock(_instanceCounterMutex);
  uint32_t total = 0;
  for (const auto& iter : _aliveInstances) {
    total += iter.second;
  }
  return total;
}

static int getId(const char* name) {
  std::unique_lock lock(_instanceCounterMutex);
  if (_instanceIds.find(name) == _instanceIds.end()) {
    _instanceIds.insert({name, 1});
  }
  auto iterator = _instanceIds.find(name);
  return iterator->second++;
}
#endif

HybridObject::HybridObject(const char* name) : HybridObjectPrototype(), _name(name) {
#if LOG_MEMORY_ALLOCATIONS
  _instanceId = getId(name);
  uint32_t alive = incrementAliveInstancesAndGet(_name);
  uint32_t totalObjects = getTotalAliveInstances();
  Logger::log(TAG, "(MEMORY) ✅ Creating %s (#%i)... (Total %s(s): %i | Total HybridObjects: %i)", _name, _instanceId, _name, alive,
              totalObjects);
#endif
}

HybridObject::~HybridObject() {
#if LOG_MEMORY_ALLOCATIONS
  uint32_t alive = decrementAliveInstancesAndGet(_name);
  uint32_t totalObjects = getTotalAliveInstances();
  Logger::log(TAG, "(MEMORY) ❌ Deleting %s (#%i)... (Total %s(s): %i | Total HybridObjects: %i) ", _name, _instanceId, _name, alive,
              totalObjects);
#endif
}

std::string HybridObject::toString() {
  return "[HybridObject " + std::string(_name) + "]";
}

std::string HybridObject::getName() {
  return _name;
}

bool HybridObject::equals(std::shared_ptr<HybridObject> other) {
  return this == other.get();
}

void HybridObject::loadHybridMethods() {
  registerHybrids(this, [](Prototype& prototype) {
    prototype.registerHybridGetter("name", &HybridObject::getName);
    prototype.registerHybridMethod("toString", &HybridObject::toString);
    prototype.registerHybridMethod("equals", &HybridObject::equals);
  });
}

jsi::Value HybridObject::toObject(jsi::Runtime& runtime) {
  // 1. Get the object's base prototype (global & shared)
  jsi::Value prototype = getPrototype(runtime);

  // 2. Get the global JS Object.create(...) constructor so we can create an object from the given prototype
  jsi::Object objectConstructor = runtime.global().getPropertyAsObject(runtime, "Object");
  jsi::Function create = objectConstructor.getPropertyAsFunction(runtime, "create");

  // 3. Create the object using Object.create(...)
  jsi::Object object = create.call(runtime, prototype).asObject(runtime);

  // 4. Assign NativeState to the object so the prototype can resolve the native methods
  object.setNativeState(runtime, shared_from_this());

#if DEBUG
  // 5. Assign a private __type property for debugging - this will be used so users know it's not just an empty object.
  object.setProperty(runtime, "__type", jsi::String::createFromUtf8(runtime, "NativeState<" + std::string(_name) + ">"));
#endif

  // 6. Return it!
  return object;
}

} // namespace margelo::nitro
