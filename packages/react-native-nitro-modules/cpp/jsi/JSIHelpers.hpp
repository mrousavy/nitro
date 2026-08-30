//
//  JSIHelpers.hpp
//  Nitro
//
//  Created by Marc Rousavy on 07.08.24.
//

#pragma once

#include "CommonGlobals.hpp"
#include "PropNameIDCache.hpp"
#include "ThreadUtils.hpp"
#include <jsi/jsi.h>
#include <string>
#include <utility>

namespace margelo::nitro {

using namespace facebook;

/**
 * Returns whether the given `jsi::Object` is a plain-JS object, or not.
 * If it is not a plain-JS object, it could be an Array, ArrayBuffer, Function,
 * HostObject or NativeState.
 */
static inline bool isPlainObject(jsi::Runtime& runtime, const jsi::Object& object) {
  if (object.isArray(runtime)) {
    return false;
  }
  if (object.isArrayBuffer(runtime)) {
    return false;
  }
  if (object.isFunction(runtime)) {
    return false;
  }
  if (object.isHostObject(runtime)) {
    return false;
  }
  if (object.hasNativeState(runtime)) {
    return false;
  }
  return true;
}

/**
 * Sets an own property while preserving `__proto__` as record data instead of
 * invoking Object.prototype's legacy prototype setter.
 */
static inline void setRecordProperty(jsi::Runtime& runtime, const jsi::Object& object, const std::string& key, jsi::Value&& value) {
  if (key == "__proto__") [[unlikely]] {
    CommonGlobals::Object::defineProperty(
        runtime, object, key.c_str(),
        PlainPropertyDescriptor{.configurable = true, .enumerable = true, .value = std::move(value), .writable = true});
  } else {
    object.setProperty(runtime, PropNameIDCache::get(runtime, key), std::move(value));
  }
}

/**
 * Get an ID for the given Runtime.
 *
 * The ID usually consists of a Runtime description (e.g. "HermesRuntime"),
 * and its Thread's name (e.g. "com.facebook.react.runtime.JavaScript")
 */
static inline std::string getRuntimeId(jsi::Runtime& runtime) {
  std::string threadName = ThreadUtils::getThreadName();
  return runtime.description() + " (" + threadName + ")";
}

} // namespace margelo::nitro
