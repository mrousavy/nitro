//
//  ObjectUtils.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 17.10.25.
//

#include "ObjectUtils.hpp"
#include "JSICache.hpp"

#if __has_include(<React-cxxreact/cxxreact/ReactNativeVersion.h>)
#include <React-cxxreact/cxxreact/ReactNativeVersion.h>
#if REACT_NATIVE_VERSION_MINOR >= 78
#define ENABLE_NATIVE_OBJECT_CREATE
#endif
#endif

namespace margelo::nitro {

using namespace facebook;

std::unordered_map<jsi::Runtime*, ObjectUtils::Cache> ObjectUtils::_cache;

jsi::Object ObjectUtils::create(jsi::Runtime& runtime, const jsi::Value& prototype) {
#ifdef ENABLE_NATIVE_OBJECT_CREATE
  return jsi::Object::create(runtime, prototype);
#else
  Cache& cache = _cache[&runtime];
  if (cache.objectCreate == nullptr) {
    auto jsiCache = JSICache::getOrCreateCache(runtime);
    jsi::Object objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
    jsi::Function createFn = objectCtor.getPropertyAsFunction(runtime, "create");
    cache.objectCreate = jsiCache.makeShared(std::move(createFn));
  }
  return cache.objectCreate->call(runtime, prototype).getObject(runtime);
#endif
}

void ObjectUtils::defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                                 PlainPropertyDescriptor&& descriptor) {
  Cache& cache = _cache[&runtime];
  if (cache.objectDefineProperty == nullptr) {
    auto jsiCache = JSICache::getOrCreateCache(runtime);
    jsi::Object objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
    jsi::Function definePropertyFn = objectCtor.getPropertyAsFunction(runtime, "defineProperty");
    cache.objectDefineProperty = jsiCache.makeShared(std::move(definePropertyFn));
  }

  jsi::String nameJs = jsi::String::createFromAscii(runtime, propertyName);

  jsi::Object descriptorJs(runtime);
  descriptorJs.setProperty(runtime, "configurable", jsi::Value(descriptor.configurable));
  descriptorJs.setProperty(runtime, "enumerable", jsi::Value(descriptor.enumerable));
  descriptorJs.setProperty(runtime, "value", std::move(descriptor.value));
  descriptorJs.setProperty(runtime, "writable", jsi::Value(descriptor.writable));

  cache.objectDefineProperty->call(runtime, object, std::move(nameJs), std::move(descriptorJs));
}

void ObjectUtils::defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                                 ComputedReadonlyPropertyDescriptor&& descriptor) {
  Cache& cache = _cache[&runtime];
  if (cache.objectDefineProperty == nullptr) {
    auto jsiCache = JSICache::getOrCreateCache(runtime);
    jsi::Object objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
    jsi::Function definePropertyFn = objectCtor.getPropertyAsFunction(runtime, "defineProperty");
    cache.objectDefineProperty = jsiCache.makeShared(std::move(definePropertyFn));
  }

  jsi::String nameJs = jsi::String::createFromAscii(runtime, propertyName);

  jsi::Object descriptorJs(runtime);
  descriptorJs.setProperty(runtime, "configurable", jsi::Value(descriptor.configurable));
  descriptorJs.setProperty(runtime, "enumerable", jsi::Value(descriptor.enumerable));
  descriptorJs.setProperty(runtime, "get", std::move(descriptor.get));

  cache.objectDefineProperty->call(runtime, object, std::move(nameJs), std::move(descriptorJs));
}

void ObjectUtils::defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                                 ComputedPropertyDescriptor&& descriptor) {
  Cache& cache = _cache[&runtime];
  if (cache.objectDefineProperty == nullptr) {
    auto jsiCache = JSICache::getOrCreateCache(runtime);
    jsi::Object objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
    jsi::Function definePropertyFn = objectCtor.getPropertyAsFunction(runtime, "defineProperty");
    cache.objectDefineProperty = jsiCache.makeShared(std::move(definePropertyFn));
  }

  jsi::String nameJs = jsi::String::createFromAscii(runtime, propertyName);

  jsi::Object descriptorJs(runtime);
  descriptorJs.setProperty(runtime, "configurable", jsi::Value(descriptor.configurable));
  descriptorJs.setProperty(runtime, "enumerable", jsi::Value(descriptor.enumerable));
  descriptorJs.setProperty(runtime, "get", std::move(descriptor.get));
  descriptorJs.setProperty(runtime, "set", std::move(descriptor.set));

  cache.objectDefineProperty->call(runtime, object, std::move(nameJs), std::move(descriptorJs));
}

void ObjectUtils::freeze(jsi::Runtime& runtime, const jsi::Object& object) {
  Cache& cache = _cache[&runtime];
  if (cache.objectFreeze == nullptr) {
    auto jsiCache = JSICache::getOrCreateCache(runtime);
    jsi::Object objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
    jsi::Function freezeFn = objectCtor.getPropertyAsFunction(runtime, "freeze");
    cache.objectFreeze = jsiCache.makeShared(std::move(freezeFn));
  }

  cache.objectFreeze->call(runtime, object);
}

} // namespace margelo::nitro
