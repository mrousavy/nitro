//
// Created by Marc Rousavy on 29.06.26.
//

#pragma once

#include "NitroDefines.hpp"
#include <react/renderer/core/RawProps.h>

namespace margelo::nitro {
namespace RawPropsCompat {
  using namespace facebook;

  // TODO: Remove this entirely once react-native 0.85 is no longer supported.
  /**
   * Same as `props.at(name)`, but includes backwards compatibility
   * for react-native 0.85 or older, which accepts more parameters.
   */
  const react::RawValue* at(const react::RawProps& props, const char* name);

} // namespace RawPropsCompat
} // namespace margelo::nitro
