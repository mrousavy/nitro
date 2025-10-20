//
//  ObjectUtils.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 17.10.25.
//

#include "ObjectUtils.hpp"
#include "JSICache.hpp"
#include "JSIHelpers.hpp"
#include "NitroDefines.hpp"

#if __has_include(<React-cxxreact/cxxreact/ReactNativeVersion.h>)
#include <React-cxxreact/cxxreact/ReactNativeVersion.h>
#if REACT_NATIVE_VERSION_MINOR >= 78
#define ENABLE_NATIVE_OBJECT_CREATE
#endif
#endif

namespace margelo::nitro {

using namespace facebook;

std::unordered_map<jsi::Runtime*, ObjectUtils::FunctionCache> ObjectUtils::_cache;

const char* ObjectUtils::getKnownGlobalPropertyNameString(KnownGlobalPropertyName name) {
  switch (name) {
    case KnownGlobalPropertyName::DISPATCHER:
      return "__nitroDispatcher";
    case KnownGlobalPropertyName::JSI_CACHE:
      return "__nitroJsiCache";
    case KnownGlobalPropertyName::NITRO_MODULES_PROXY:
      return "NitroModulesProxy";
  }
}

jsi::Object ObjectUtils::create(jsi::Runtime& runtime, const jsi::Value& prototype, bool allowCache) {
#ifdef ENABLE_NATIVE_OBJECT_CREATE
  return jsi::Object::create(runtime, prototype);
#else
  BorrowingReference<jsi::Function> createFn = getGlobalFunction(
      runtime, "Object.create",
      [](jsi::Runtime& runtime) {
        return runtime.global().getPropertyAsObject(runtime, "Object").getPropertyAsFunction(runtime, "create");
      },
      allowCache);
  return createFn->call(runtime, prototype).getObject(runtime);
#endif
}

void ObjectUtils::defineGlobal(jsi::Runtime& runtime, KnownGlobalPropertyName name, jsi::Value&& value, bool allowCache) {
  const char* nameString = getKnownGlobalPropertyNameString(name);

#ifdef NITRO_DEBUG
  // In debug, let's perform additional safety checks.
  if (runtime.global().hasProperty(runtime, nameString)) [[unlikely]] {
    throw std::runtime_error("Failed to set `global." + std::string(nameString) + "` - it already exists for Runtime \"" +
                             getRuntimeId(runtime) + "\"! Did you call `defineGlobal(\"" + std::string(nameString) +
                             "\")` twice? Did you link Nitro Modules twice?");
  }
  defineProperty(runtime, runtime.global(), nameString,
                 PlainPropertyDescriptor{.configurable = false, .enumerable = true, .value = std::move(value), .writable = false},
                 allowCache);
#else
  // In release, just set the property.
  runtime.global().setProperty(runtime, nameString, std::move(value));
#endif
}

void ObjectUtils::defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                                 PlainPropertyDescriptor&& descriptor, bool allowCache) {
  BorrowingReference<jsi::Function> definePropertyFn = getGlobalFunction(
      runtime, "Object.defineProperty",
      [](jsi::Runtime& runtime) {
        return runtime.global().getPropertyAsObject(runtime, "Object").getPropertyAsFunction(runtime, "defineProperty");
      },
      allowCache);

  jsi::String nameJs = jsi::String::createFromAscii(runtime, propertyName);

  jsi::Object descriptorJs(runtime);
  descriptorJs.setProperty(runtime, "configurable", jsi::Value(descriptor.configurable));
  descriptorJs.setProperty(runtime, "enumerable", jsi::Value(descriptor.enumerable));
  descriptorJs.setProperty(runtime, "value", std::move(descriptor.value));
  descriptorJs.setProperty(runtime, "writable", jsi::Value(descriptor.writable));

  definePropertyFn->call(runtime, object, std::move(nameJs), std::move(descriptorJs));
}

void ObjectUtils::defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                                 ComputedReadonlyPropertyDescriptor&& descriptor, bool allowCache) {
  BorrowingReference<jsi::Function> definePropertyFn = getGlobalFunction(
      runtime, "Object.defineProperty",
      [](jsi::Runtime& runtime) {
        return runtime.global().getPropertyAsObject(runtime, "Object").getPropertyAsFunction(runtime, "defineProperty");
      },
      allowCache);

  jsi::String nameJs = jsi::String::createFromAscii(runtime, propertyName);

  jsi::Object descriptorJs(runtime);
  descriptorJs.setProperty(runtime, "configurable", jsi::Value(descriptor.configurable));
  descriptorJs.setProperty(runtime, "enumerable", jsi::Value(descriptor.enumerable));
  descriptorJs.setProperty(runtime, "get", std::move(descriptor.get));

  definePropertyFn->call(runtime, object, std::move(nameJs), std::move(descriptorJs));
}

void ObjectUtils::defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                                 ComputedPropertyDescriptor&& descriptor, bool allowCache) {
  BorrowingReference<jsi::Function> definePropertyFn = getGlobalFunction(
      runtime, "Object.defineProperty",
      [](jsi::Runtime& runtime) {
        return runtime.global().getPropertyAsObject(runtime, "Object").getPropertyAsFunction(runtime, "defineProperty");
      },
      allowCache);

  jsi::String nameJs = jsi::String::createFromAscii(runtime, propertyName);

  jsi::Object descriptorJs(runtime);
  descriptorJs.setProperty(runtime, "configurable", jsi::Value(descriptor.configurable));
  descriptorJs.setProperty(runtime, "enumerable", jsi::Value(descriptor.enumerable));
  descriptorJs.setProperty(runtime, "get", std::move(descriptor.get));
  descriptorJs.setProperty(runtime, "set", std::move(descriptor.set));

  definePropertyFn->call(runtime, object, std::move(nameJs), std::move(descriptorJs));
}

void ObjectUtils::freeze(jsi::Runtime& runtime, const jsi::Object& object, bool allowCache) {
  BorrowingReference<jsi::Function> freezeFn = getGlobalFunction(
      runtime, "Object.freeze",
      [](jsi::Runtime& runtime) {
        return runtime.global().getPropertyAsObject(runtime, "Object").getPropertyAsFunction(runtime, "freeze");
      },
      allowCache);

  freezeFn->call(runtime, object);
}

BorrowingReference<jsi::Function> ObjectUtils::getGlobalFunction(jsi::Runtime& runtime, const char* key,
                                                                 std::function<jsi::Function(jsi::Runtime&)> getFunction, bool allowCache) {
  if (allowCache) [[likely]] {
    // Let's try to find the function in cache
    FunctionCache& functionCache = _cache[&runtime];
    std::string stringKey = key;
    auto iterator = functionCache.find(stringKey);
    if (iterator != functionCache.end()) {
      // We found it! Copy & return the reference
      BorrowingReference<jsi::Function> function = iterator->second;
      return function;
    }
  }
  // We haven't found the function with the given key in cache - so let's get it:
  jsi::Function function = getFunction(runtime);
  if (allowCache) [[likely]] {
    // Let's throw it in cache!
    FunctionCache& functionCache = _cache[&runtime];
    JSICacheReference jsiCache = JSICache::getOrCreateCache(runtime);
    BorrowingReference<jsi::Function> sharedFunction = jsiCache.makeShared(std::move(function));
    functionCache[std::string(key)] = sharedFunction;
    return sharedFunction;
  } else {
    // We are not allowed to use cache - so let's just wrap it in a BorrowingReference to match the return type.
    jsi::Function* heapFunction = new jsi::Function(std::move(function));
    return BorrowingReference<jsi::Function>(heapFunction);
  }
}

} // namespace margelo::nitro
