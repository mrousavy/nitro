//
// Created by Marc Rousavy on 29.06.26.
//

#pragma once

#include "NitroDefines.hpp"
#if __has_include(<cxxreact/ReactNativeVersion.h>)
#include <cxxreact/ReactNativeVersion.h>
#endif
#include <react/renderer/core/RawProps.h>

namespace margelo::nitro {
namespace RawPropsCompat {
  using namespace facebook;

  // TODO: Remove this entirely once react-native 0.86 is no longer supported.
  /**
   * Same as `props.at(name)`, but includes backwards compatibility
   * for react-native 0.86 or older, which accepts more parameters.
   */
  inline const react::RawValue* at(const react::RawProps& props, const char* name) {
#if defined(REACT_NATIVE_VERSION_MAJOR) && (REACT_NATIVE_VERSION_MAJOR > 0 || REACT_NATIVE_VERSION_MINOR > 86)
    // react-native 0.87 removed the `at(name, prefix, suffix)` overload of
    // `react::RawProps` in favor of a single-argument `at(name)`.
    return props.at(name);
#else
    return props.at(name, nullptr, nullptr);
#endif
  }

} // namespace RawPropsCompat
} // namespace margelo::nitro
