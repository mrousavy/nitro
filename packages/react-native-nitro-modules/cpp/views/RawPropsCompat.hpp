//
// Created by Marc Rousavy on 29.06.26.
//

#pragma once

#include <react/renderer/core/RawProps.h>

namespace margelo::nitro::RawPropsCompat {

/**
 * Same as `props.at(name)`, with compatibility for React Native 0.79 through
 * 0.86, where `RawProps::at(...)` requires prefix and suffix arguments.
 *
 * The available overload is detected at compile-time instead of reading
 * `<cxxreact/ReactNativeVersion.h>`: this header is part of the NitroModules
 * modulemap, and a `cxxreact` import inside a modular header breaks iOS
 * builds using `use_frameworks!` - clang then has to build the `cxxreact`
 * module from the consumer's context, which fails because cxxreact's own
 * headers need search paths (e.g. jsinspector-modern) that are not exposed
 * to third-party pods.
 */
template <typename TRawProps = facebook::react::RawProps>
const facebook::react::RawValue* at(const TRawProps& props, const char* name) {
  if constexpr (requires { props.at(name); }) {
    // React Native 0.87+: canonical single-argument overload.
    return props.at(name);
  } else {
    // React Native 0.79 - 0.86: prefix and suffix arguments are required.
    return props.at(name, nullptr, nullptr);
  }
}

} // namespace margelo::nitro::RawPropsCompat
