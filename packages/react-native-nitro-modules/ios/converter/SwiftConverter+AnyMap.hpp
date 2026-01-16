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

namespace margelo::nitro {
template <typename T, typename Enable>
struct SwiftConverter;
}

namespace NitroModules {
  // Defined in NitroModules-Swift.h via Interop
  class AnyMap;
}

#include "SwiftConverter.hpp"

namespace margelo::nitro {

template <>
struct SwiftConverter<std::shared_ptr<AnyMap>> final {
  using SwiftType = NitroModules::AnyMap;
  static std::shared_ptr<AnyMap> fromSwift(SwiftType& swiftAnyMap);
  static SwiftType toSwift(const std::shared_ptr<AnyMap>& cppAnyMap);
};

}
