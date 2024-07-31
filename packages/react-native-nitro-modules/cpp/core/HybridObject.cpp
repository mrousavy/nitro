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

jsi::Value HybridObject::toObject(jsi::Runtime& runtime) {
  // 1. Try to find existing jsi::Object from cache
  auto found = _jsObjects.find(&runtime);
  if (found != _jsObjects.end()) {
    // 1.1 We found an object in cache, let's see if it's still alive..
    BorrowingReference<jsi::Object> weak = found->second;
    OwningReference<jsi::Object> strong = weak.lock();
    if (strong) {
      // 1.2. It is alive (strong) - update memory size and return to JS!
      size_t memorySize = getTotalExternalMemorySize();
      strong->setExternalMemoryPressure(runtime, memorySize);
      // 1.3. It is alive (strong) - copy the JSI Pointer into a new jsi::Value, and return to JS
      return jsi::Value(runtime, *strong);
    }
  }

  // 2. There is either no value in cache, or it's already dead. Create a new one
  auto cache = JSICache<jsi::Object>::getOrCreateCache(runtime);
  // 3. Create a new jsi::Object from this HybridObject/jsi::HostObject
  std::shared_ptr<HybridObject> shared = shared_from_this();
  jsi::Object object = jsi::Object::createFromHostObject(runtime, shared);
  // 4. HybridObjects expose their external memory size, so inform JS GC about it!
  size_t memorySize = getTotalExternalMemorySize();
  object.setExternalMemoryPressure(runtime, memorySize);
  // 5. Make it a global (weak) reference
  auto global = cache.makeGlobal(std::move(object));
  _jsObjects[&runtime] = global.weak();
  // 6. Return a jsi::Value copy again to the caller.
  return jsi::Value(runtime, *global);
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
  registerHybridGetter("name", &HybridObject::getName, this);
  registerHybridMethod("toString", &HybridObject::toString, this);
  registerHybridMethod("equals", &HybridObject::equals, this);
}

std::vector<jsi::PropNameID> HybridObject::getPropertyNames(facebook::jsi::Runtime& runtime) {
  std::unique_lock lock(*_mutex);
  ensureInitialized(runtime);

  std::vector<jsi::PropNameID> result;
  size_t totalSize = _methods.size() + _getters.size() + _setters.size() + 1;
  result.reserve(totalSize);

  for (const auto& item : _methods) {
    result.push_back(jsi::PropNameID::forUtf8(runtime, item.first));
  }
  for (const auto& item : _getters) {
    result.push_back(jsi::PropNameID::forUtf8(runtime, item.first));
  }
  for (const auto& item : _setters) {
    result.push_back(jsi::PropNameID::forUtf8(runtime, item.first));
  }
  return result;
}

jsi::Value HybridObject::get(facebook::jsi::Runtime& runtime, const facebook::jsi::PropNameID& propName) {
  std::string name = propName.utf8(runtime);
  try {
    std::unique_lock lock(*_mutex);
    ensureInitialized(runtime);

    auto& functionCache = _functionCache[&runtime];

    if (functionCache.contains(name)) [[likely]] {
      // cache hit - let's see if the function is still alive..
      OwningReference<jsi::Function> function = functionCache[name];
      if (function) [[likely]] {
        // function is still alive, we can use it.
        return jsi::Value(runtime, *function);
      }
    }

    if (_getters.contains(name)) {
      // it's a property getter. call it directly
      return _getters[name](runtime, jsi::Value::undefined(), nullptr, 0);
    }

    if (_methods.contains(name)) {
      // it's a function. we now need to wrap it in a jsi::Function, store it in cache, then return it.
      HybridFunction& hybridFunction = _methods.at(name);
      // get (or create) a runtime-specific function cache
      auto runtimeCache = JSICache<jsi::Function>::getOrCreateCache(runtime);
      // create the jsi::Function
      jsi::Function function = jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, name),
                                                                     hybridFunction.parameterCount, hybridFunction.function);
      // throw it into the cache for next time
      OwningReference<jsi::Function> globalFunction = runtimeCache.makeGlobal(std::move(function));
      functionCache[name] = globalFunction;
      // copy the reference & return it to JS
      return jsi::Value(runtime, *globalFunction);
    }

    // this property does not exist. Return undefined
    return jsi::Value::undefined();
  } catch (const std::exception& exception) {
    std::string hybridObjectName = _name;
    std::string message = exception.what();
    throw std::runtime_error(hybridObjectName + "." + name + " threw an error: " + message);
  } catch (...) {
    std::string hybridObjectName = _name;
    std::string errorName = TypeInfo::getCurrentExceptionName();
    throw std::runtime_error(hybridObjectName + "." + name + " threw an unknown " + errorName + " error.");
  }
}

void HybridObject::set(facebook::jsi::Runtime& runtime, const facebook::jsi::PropNameID& propName, const facebook::jsi::Value& value) {
  std::string name = propName.utf8(runtime);

  try {
    std::unique_lock lock(*_mutex);
    ensureInitialized(runtime);

    if (_setters.contains(name)) {
      // Call setter
      _setters[name](runtime, jsi::Value::undefined(), &value, 1);
      return;
    }
  } catch (const std::exception& exception) {
    std::string hybridObjectName = _name;
    std::string message = exception.what();
    throw std::runtime_error(hybridObjectName + "." + name + " threw an error: " + message);
  } catch (...) {
    std::string hybridObjectName = _name;
    std::string errorName = TypeInfo::getCurrentExceptionName();
    throw std::runtime_error(hybridObjectName + "." + name + " threw an unknown " + errorName + " error.");
  }

  // this property does not exist, and cannot be set. Throw and error!
  throw std::runtime_error("Cannot set property \"" + name + "\" - " + std::string(_name) + " does not have a setter for \"" + name +
                           "\"!");
}

void HybridObject::ensureInitialized(facebook::jsi::Runtime& runtime) {
  if (!_didLoadMethods) [[unlikely]] {
    // lazy-load all exposed methods
    loadHybridMethods();
    _didLoadMethods = true;
  }
}

} // namespace margelo::nitro
