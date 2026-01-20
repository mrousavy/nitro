//
//  SwiftConverter+AnyMap.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 16.01.26.
//

#include "SwiftConverter+AnyMap.hpp"
#include "SwiftConverter.hpp"
#include <NitroModules/NitroModules-Swift-Cxx-Umbrella.hpp>

namespace margelo::nitro {

std::shared_ptr<AnyMap> fromSwift(NitroModules::AnyMap& swiftAnyMap) {
  std::shared_ptr<AnyMap> result = AnyMap::make(swiftAnyMap.getCount());
  // TODO: Actually convert
  return result;
}

NitroModules::AnyMap toSwift(const std::shared_ptr<AnyMap>& cppAnyMap) {
  std::unordered_map<std::string, AnyValue>& map = cppAnyMap->getMap();
  NitroModules::AnyMap result = NitroModules::AnyMap::init(map.size());
  // TODO: Actually convert
  return NitroModules::AnyMap::init();
}

}
