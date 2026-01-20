//
//  SwiftConverter+AnyMap.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 16.01.26.
//

#pragma once

#include "NitroDefines.hpp"
#include "AnyMap.hpp"
#include <memory>

namespace NitroModules {
  // Defined in NitroModules-Swift.h via Interop
  class AnyMap;
}
namespace margelo::nitro {
template <typename T, typename Enable>
struct SwiftConverter;
}

namespace margelo::nitro {

template <>
struct SwiftConverter<std::shared_ptr<AnyMap>, void> final {
  using SwiftType = NitroModules::AnyMap;
  static std::shared_ptr<AnyMap> fromSwift(NitroModules::AnyMap& swiftAnyMap);
  static NitroModules::AnyMap toSwift(const std::shared_ptr<AnyMap>& cppAnyMap);
};

}
