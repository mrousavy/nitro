//
// Created by Marc Rousavy on 21.02.24.
//

#include "HybridObject.hpp"
#include "JSIConverter.hpp"
#include "NitroLogger.hpp"
#include "HybridContext.hpp"
#include <chrono>

namespace margelo::nitro {

#if DEBUG && _ENABLE_LOGS
static int getId(const char* name) {
  static std::unordered_map<const char*, int> _instanceIds;
  static std::mutex _mutex;
  std::unique_lock lock(_mutex);
  if (_instanceIds.find(name) == _instanceIds.end()) {
    _instanceIds.insert({name, 1});
  }
  auto iterator = _instanceIds.find(name);
  return iterator->second++;
}
#endif

HybridObject::HybridObject(const char* name) : _name(name), _mutex(std::make_unique<std::mutex>()) {
#if DEBUG && _ENABLE_LOGS
  _instanceId = getId(name);
  Logger::log(TAG, "(MEMORY) Creating %s (#%i)... ✅", _name, _instanceId);
#endif
}

HybridObject::~HybridObject() {
#if DEBUG && _ENABLE_LOGS
  Logger::log(TAG, "(MEMORY) Deleting %s (#%i)... ❌", _name, _instanceId);
#endif
  _functionCache.clear();
}

std::string HybridObject::toString() {
  return "[HybridObject " + std::string(_name) + " ]";
}

void HybridObject::loadHybridMethods() {
  registerHybridMethod("toString", &HybridObject::toString, this);
}

std::vector<jsi::PropNameID> HybridObject::getPropertyNames(facebook::jsi::Runtime& runtime) {
  auto start = std::chrono::steady_clock::now();
  
  std::unique_lock lock(*_mutex);
  ensureInitialized(runtime);
  
  auto propNameCache = _propNameCache[&runtime];
  

  if (propNameCache.empty()) {
    size_t totalSize = _methods.size() + _getters.size() + _setters.size() + 1;
    propNameCache.reserve(totalSize);

    for (const auto& item : _methods) {
      auto propName = jsi::PropNameID::forUtf8(runtime, item.first);
      auto reference = OwningReference<jsi::PropNameID>(new jsi::PropNameID(std::move(propName)));
      propNameCache.push_back(reference);
    }
    for (const auto& item : _getters) {
      auto propName = jsi::PropNameID::forUtf8(runtime, item.first);
      auto reference = OwningReference<jsi::PropNameID>(new jsi::PropNameID(std::move(propName)));
      propNameCache.push_back(reference);
    }
    for (const auto& item : _setters) {
      auto propName = jsi::PropNameID::forUtf8(runtime, item.first);
      auto reference = OwningReference<jsi::PropNameID>(new jsi::PropNameID(std::move(propName)));
      propNameCache.push_back(reference);
    }
  }
  
  // Get props from cache
  std::vector<jsi::PropNameID> props;
  props.reserve(propNameCache.size());
  for (auto& reference : propNameCache) {
    props.push_back(jsi::PropNameID(runtime, *reference));
  }
  
  auto end = std::chrono::steady_clock::now();
  auto elapsed = std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();
  Logger::log(TAG, "getPropertyNames took " + std::to_string(elapsed) + "ms for " + std::to_string(props.size()) + " props.");
  
  return props;
}

jsi::Value HybridObject::get(facebook::jsi::Runtime& runtime, const facebook::jsi::PropNameID& propName) {
  std::unique_lock lock(*_mutex);
  ensureInitialized(runtime);

  std::string name = propName.utf8(runtime);
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
    auto runtimeCache = JSICache<jsi::Function>::getOrCreateCache(runtime).lock();
    // create the jsi::Function
    jsi::Function function = jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, name),
                                                                   hybridFunction.parameterCount, hybridFunction.function);
    // throw it into the cache for next time
    OwningReference<jsi::Function> globalFunction = runtimeCache->makeGlobal(std::move(function));
    functionCache[name] = globalFunction;
    // copy the reference & return it to JS
    return jsi::Value(runtime, *globalFunction);
  }

  // this property does not exist. Return undefined
  return jsi::Value::undefined();
}

void HybridObject::set(facebook::jsi::Runtime& runtime, const facebook::jsi::PropNameID& propName, const facebook::jsi::Value& value) {
  std::unique_lock lock(*_mutex);
  ensureInitialized(runtime);

  std::string name = propName.utf8(runtime);

  if (_setters.contains(name)) {
    // Call setter
    _setters[name](runtime, jsi::Value::undefined(), &value, 1);
    return;
  }

  // this property does not exist, and cannot be set. Throw and error!
  throw std::runtime_error("Cannot set property \"" + name + "\" - " + std::string(_name) +
                           " does not have a setter for \"" + name + "\"!");
}

void HybridObject::ensureInitialized(facebook::jsi::Runtime& runtime) {
  if (!_didLoadMethods) [[unlikely]] {
    // lazy-load all exposed methods
    loadHybridMethods();
    _didLoadMethods = true;
  }
}

} // namespace margelo::nitro
