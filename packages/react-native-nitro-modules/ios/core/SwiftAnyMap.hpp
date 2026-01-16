//
//  SwiftAnyMap.hpp
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

/**
 * A C++ wrapper around the `NitroModules::AnyMap` Swift type
 * to allow using it externally without relying on Swift symbols.
 */
  class SwiftAnyMap final {
  public:
    SwiftAnyMap(const NitroModules::AnyMap& swiftPart);

  public:
    NitroModules::AnyMap getSwiftPart() const;

  private:
    std::shared_ptr<NitroModules::AnyMap> _swiftPart;
  };

}

#include "SwiftConverter.hpp"

namespace margelo::nitro {

template <>
struct SwiftConverter<std::shared_ptr<AnyMap>> final {
  using SwiftType = SwiftAnyMap;
  static std::shared_ptr<AnyMap> fromSwift(const SwiftAnyMap& swiftAnyMap);
  static SwiftAnyMap toSwift(const std::shared_ptr<AnyMap>& cppAnyMap);
};

}
