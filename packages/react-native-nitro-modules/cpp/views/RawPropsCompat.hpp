//
// Created by Marc Rousavy on 29.06.26.
//

#pragma once

#if __has_include(<cxxreact/ReactNativeVersion.h>)
#include <cxxreact/ReactNativeVersion.h>
#endif
#include <react/renderer/core/RawProps.h>

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
