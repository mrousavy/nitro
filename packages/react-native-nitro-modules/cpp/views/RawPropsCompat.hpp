//
// Created by Marc Rousavy on 29.06.26.
//

#pragma once

#if __has_include(<cxxreact/ReactNativeVersion.h>)
#include <cxxreact/ReactNativeVersion.h>
#endif
#include <react/renderer/core/RawProps.h>

/**
 * `NITRO_RAW_FUNCTION_PROPS` is `1` if React Native transports JS functions to
 * native as raw JSI functions, and `0` if they have to be wrapped in objects.
 *
 * Before React Native 0.81, every function prop was converted to `true` before
 * it reached native - Nitro works around that by wrapping functions in a
 * `{ f: function }` object (see `callback(...)`).
 * Since React Native 0.81, a View Config can opt out of that conversion by
 * declaring a `process` function for the prop (which Nitro always does - see
 * `getHostComponent.ts`), so functions arrive as raw `jsi::Function`s.
 * @see https://github.com/facebook/react-native/pull/48777
 */
#if defined(REACT_NATIVE_VERSION_MAJOR) && (REACT_NATIVE_VERSION_MAJOR > 0 || REACT_NATIVE_VERSION_MINOR >= 81)
#define NITRO_RAW_FUNCTION_PROPS 1
#else
#define NITRO_RAW_FUNCTION_PROPS 0
#endif

namespace margelo::nitro::RawPropsCompat {

/**
 * Same as `props.at(name)`, with compatibility for React Native 0.79 through
 * 0.86, where `RawProps::at(...)` requires prefix and suffix arguments.
 */
inline const facebook::react::RawValue* at(const facebook::react::RawProps& props, const char* name) {
#if defined(REACT_NATIVE_VERSION_MAJOR) && (REACT_NATIVE_VERSION_MAJOR > 0 || REACT_NATIVE_VERSION_MINOR > 86)
  // React Native 0.87 introduced the canonical single-argument overload.
  return props.at(name);
#else
  return props.at(name, nullptr, nullptr);
#endif
}

} // namespace margelo::nitro::RawPropsCompat
