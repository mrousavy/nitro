//
// Created by Marc Rousavy on 21.02.24.
//

#include "HybridObject.hpp"
#include "JSIConverter.hpp"
#include "NitroLogger.hpp"

namespace margelo {

#if DEBUG && _ENABLE_LOGS
static std::unordered_map<const char*, int> _instanceIds;
static std::mutex _mutex;

static int getId(const char* name) {
  std::unique_lock lock(_mutex);
  if (_instanceIds.find(name) == _instanceIds.end()) {
    _instanceIds.insert({name, 1});
  }
  auto iterator = _instanceIds.find(name);
  return iterator->second++;
}
#endif

HybridObject::HybridObject(const char* name) : _name(name) {
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

std::string HybridObject::toString(jsi::Runtime& runtime) {
  std::string result = std::string(_name) + " { ";
  std::vector<jsi::PropNameID> props = getPropertyNames(runtime);
  for (size_t i = 0; i < props.size(); i++) {
    auto suffix = i < props.size() - 1 ? ", " : " ";
    result += "\"" + props[i].utf8(runtime) + "\"" + suffix;
  }
  return result + "}";
}

std::vector<jsi::PropNameID> HybridObject::getPropertyNames(facebook::jsi::Runtime& runtime) {
  std::unique_lock lock(_mutex);
  ensureInitialized(runtime);

  std::vector<jsi::PropNameID> result;
  size_t totalSize = _methods.size() + _getters.size() + _setters.size();
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
  std::unique_lock lock(_mutex);
  ensureInitialized(runtime);

  std::string name = propName.utf8(runtime);
  auto& functionCache = _functionCache[&runtime];
  
  
  if (functionCache.count(name) > 0) {
    [[likely]];
    // cache hit
    return jsi::Value(runtime, *functionCache[name]);
  }

  if (_getters.count(name) > 0) {
    // it's a property getter
    return _getters[name](runtime, jsi::Value::undefined(), nullptr, 0);
  }

  if (_methods.count(name) > 0) {
    // cache miss - create jsi::Function and cache it.
    HybridFunction& hybridFunction = _methods.at(name);
    jsi::Function function = jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, name),
                                                                   hybridFunction.parameterCount, hybridFunction.function);
    // TODO: Weakify function using RuntimeWatch so the Runtime safely manages it's lifetime, not us.
    functionCache[name] = std::make_shared<jsi::Function>(std::move(function));
    return jsi::Value(runtime, *functionCache[name]);
  }

  if (name == "toString") {
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, "toString"), 0,
        [=](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* args, size_t count) -> jsi::Value {
          std::string stringRepresentation = this->toString(runtime);
          return jsi::String::createFromUtf8(runtime, stringRepresentation);
        });
  }

  return jsi::HostObject::get(runtime, propName);
}

void HybridObject::set(facebook::jsi::Runtime& runtime, const facebook::jsi::PropNameID& propName, const facebook::jsi::Value& value) {
  std::unique_lock lock(_mutex);
  ensureInitialized(runtime);

  std::string name = propName.utf8(runtime);

  if (_setters.count(name) > 0) {
    // Call setter
    _setters[name](runtime, jsi::Value::undefined(), &value, 1);
    return;
  }

  HostObject::set(runtime, propName, value);
}

void HybridObject::ensureInitialized(facebook::jsi::Runtime& runtime) {
  if (!_didLoadMethods) {
    [[unlikely]];
    // lazy-load all exposed methods
    loadHybridMethods();
    _didLoadMethods = true;
  }
}

} // namespace margelo
