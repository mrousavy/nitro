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

HybridObject::HybridObject(const char* name) : _name(name), _mutex(std::make_unique<std::mutex>()) {
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
  _functionCache.clear();
}

size_t HybridObject::getTotalExternalMemorySize() noexcept {
  static constexpr int STRING_KEY_AVERAGE_SIZE = 32; // good average for string keys
  static constexpr int CACHED_SIZE = STRING_KEY_AVERAGE_SIZE + sizeof(jsi::Function);
  static constexpr int METHOD_SIZE = STRING_KEY_AVERAGE_SIZE + sizeof(HybridFunction);
  static constexpr int GETTER_SIZE = STRING_KEY_AVERAGE_SIZE + sizeof(jsi::HostFunctionType);
  static constexpr int SETTER_SIZE = STRING_KEY_AVERAGE_SIZE + sizeof(jsi::HostFunctionType);

  size_t cachedFunctions = 0;
  for (const auto& cache : _functionCache) {
    cachedFunctions += cache.second.size();
  }

  size_t externalSize = getExternalMemorySize();
  return (_getters.size() * GETTER_SIZE) + (_setters.size() * SETTER_SIZE) + (_methods.size() * METHOD_SIZE) +
         (cachedFunctions * CACHED_SIZE) + sizeof(std::mutex) + externalSize;
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
  registerHybridGetter("name", &HybridObject::getName);
  registerHybridMethod("toString", &HybridObject::toString);
  registerHybridMethod("equals", &HybridObject::equals);
}

jsi::Object HybridObject::getPrototype(jsi::Runtime& runtime) {
  std::unique_lock lock(*_mutex);
  ensureInitialized();
  
  jsi::Object prototype(runtime);
  for (const auto& method : _methods) {
    prototype.setProperty(runtime,
                          method.first.c_str(),
                          jsi::Function::createFromHostFunction(runtime,
                                                                jsi::PropNameID::forUtf8(runtime, method.first),
                                                                method.second.parameterCount,
                                                                method.second.function));
  }
  
  jsi::Object objectConstructor = runtime.global().getPropertyAsObject(runtime, "Object");
  jsi::Function defineProperty = objectConstructor.getPropertyAsFunction(runtime, "defineProperty");
  for (const auto& getter : _getters) {
    jsi::Object property(runtime);
    property.setProperty(runtime, "configurable", false);
    property.setProperty(runtime, "enumerable", true);
    property.setProperty(runtime, "get", jsi::Function::createFromHostFunction(runtime,
                                                                               jsi::PropNameID::forUtf8(runtime, "get"),
                                                                               0,
                                                                               getter.second));
    
    const auto& setter = _setters.find(getter.first);
    if (setter != _setters.end()) {
      // there also is a setter for this property!
      property.setProperty(runtime, "set", jsi::Function::createFromHostFunction(runtime,
                                                                                 jsi::PropNameID::forUtf8(runtime, "set"),
                                                                                 1,
                                                                                 setter->second));
    }
    
    property.setProperty(runtime, "name", jsi::String::createFromUtf8(runtime, getter.first.c_str()));
    defineProperty.call(runtime,
                        /* obj */ prototype,
                        /* propName */ jsi::String::createFromUtf8(runtime, getter.first.c_str()),
                        /* descriptorObj */ property);
  }
  return prototype;
}

jsi::Value HybridObject::toObject(jsi::Runtime& runtime) {
  jsi::Object prototype = getPrototype(runtime);
  
  jsi::Object object(runtime);
  
  jsi::Object objectConstructor = runtime.global().getPropertyAsObject(runtime, "Object");
  jsi::Function setPrototype = objectConstructor.getPropertyAsFunction(runtime, "setPrototypeOf");
  setPrototype.call(runtime, object, prototype);
  
  object.setNativeState(runtime, shared_from_this());
  
  return object;
}

void HybridObject::ensureInitialized() {
  if (!_didLoadMethods) [[unlikely]] {
    // lazy-load all exposed methods
    loadHybridMethods();
    _didLoadMethods = true;
  }
}

} // namespace margelo::nitro
