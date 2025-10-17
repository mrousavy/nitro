//
//  ObjectUtils.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 17.10.25.
//

#include "ObjectUtils.hpp"

#if __has_include(<React-cxxreact/cxxreact/ReactNativeVersion.h>)
#include <React-cxxreact/cxxreact/ReactNativeVersion.h>
#if REACT_NATIVE_VERSION_MINOR >= 80
#define ENABLE_NATIVE_OBJECT_CREATE
#endif
#endif

namespace margelo::nitro {

using namespace facebook;

jsi::Object ObjectUtils::create(jsi::Runtime& runtime, const jsi::Value& prototype) {
#ifdef ENABLE_NATIVE_OBJECT_CREATE
  return jsi::Object::create(runtime, prototype);
#else
  // TODO: Cache this
  jsi::Object objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
  jsi::Function createFn = objectCtor.getPropertyAsFunction(runtime, "create");
  return createFn.call(runtime, prototype).getObject(runtime);
#endif
}

void ObjectUtils::defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                                 PlainPropertyDescriptor&& descriptor) {
  // TODO: Cache this
  jsi::Object objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
  jsi::Function definePropertyFn = objectCtor.getPropertyAsFunction(runtime, "defineProperty");

  jsi::String nameJs = jsi::String::createFromAscii(runtime, propertyName);

  jsi::Object descriptorJs(runtime);
  descriptorJs.setProperty(runtime, "configurable", jsi::Value(descriptor.configurable));
  descriptorJs.setProperty(runtime, "enumerable", jsi::Value(descriptor.enumerable));
  descriptorJs.setProperty(runtime, "value", std::move(descriptor.value));
  descriptorJs.setProperty(runtime, "writable", jsi::Value(descriptor.writable));

  definePropertyFn.call(runtime, std::move(nameJs), std::move(descriptorJs));
}

void ObjectUtils::defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                                 ComputedReadonlyPropertyDescriptor&& descriptor) {
  // TODO: Cache this
  jsi::Object objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
  jsi::Function definePropertyFn = objectCtor.getPropertyAsFunction(runtime, "defineProperty");

  jsi::String nameJs = jsi::String::createFromAscii(runtime, propertyName);

  jsi::Object descriptorJs(runtime);
  descriptorJs.setProperty(runtime, "configurable", jsi::Value(descriptor.configurable));
  descriptorJs.setProperty(runtime, "enumerable", jsi::Value(descriptor.enumerable));
  descriptorJs.setProperty(runtime, "get", std::move(descriptor.get));

  definePropertyFn.call(runtime, std::move(nameJs), std::move(descriptorJs));
}

void ObjectUtils::defineProperty(jsi::Runtime& runtime, const jsi::Object& object, const char* propertyName,
                                 ComputedPropertyDescriptor&& descriptor) {
  // TODO: Cache this
  jsi::Object objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
  jsi::Function definePropertyFn = objectCtor.getPropertyAsFunction(runtime, "defineProperty");

  jsi::String nameJs = jsi::String::createFromAscii(runtime, propertyName);

  jsi::Object descriptorJs(runtime);
  descriptorJs.setProperty(runtime, "configurable", jsi::Value(descriptor.configurable));
  descriptorJs.setProperty(runtime, "enumerable", jsi::Value(descriptor.enumerable));
  descriptorJs.setProperty(runtime, "get", std::move(descriptor.get));
  descriptorJs.setProperty(runtime, "set", std::move(descriptor.set));

  definePropertyFn.call(runtime, std::move(nameJs), std::move(descriptorJs));
}

void ObjectUtils::freeze(jsi::Runtime& runtime, const jsi::Object& object) {
  // TODO: Cache this
  jsi::Object objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
  jsi::Function freezeFn = objectCtor.getPropertyAsFunction(runtime, "freeze");
  freezeFn.call(runtime, object);
}

} // namespace margelo::nitro
