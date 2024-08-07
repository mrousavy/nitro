//
// Created by Marc Rousavy on 21.02.24.
//

#include "HybridObject.hpp"
#include "HybridContext.hpp"
#include "JSIConverter.hpp"
#include "NitroLogger.hpp"

#define LOG_MEMORY_ALLOCATIONS true

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
  jsi::Object prototype = getPrototype(runtime);

  jsi::Object objectConstructor = runtime.global().getPropertyAsObject(runtime, "Object");
  jsi::Function create = objectConstructor.getPropertyAsFunction(runtime, "create");

  jsi::Object object = create.call(runtime, prototype).asObject(runtime);

  object.setNativeState(runtime, shared_from_this());

#if DEBUG
  object.setProperty(runtime, "__type", jsi::String::createFromUtf8(runtime, "NativeState<" + std::string(_name) + ">"));
#endif

  return object;
}

} // namespace margelo::nitro
