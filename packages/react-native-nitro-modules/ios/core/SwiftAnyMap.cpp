//
//  SwiftAnyMap.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 16.01.26.
//

#include "SwiftAnyMap.hpp"
#include <NitroModules/NitroModules-Swift-Cxx-Umbrella.hpp>

namespace margelo::nitro {

SwiftAnyMap::SwiftAnyMap(const NitroModules::AnyMap& swiftPart) {
  _swiftPart = std::make_shared<NitroModules::AnyMap>(swiftPart);
}

NitroModules::AnyMap SwiftAnyMap::getSwiftPart() const {
  return *_swiftPart;
}

}

namespace margelo::nitro {

std::shared_ptr<AnyMap> fromSwift(const SwiftAnyMap& swiftAnyMap) {
  NitroModules::AnyMap swiftPart = swiftAnyMap.getSwiftPart();
  std::shared_ptr<AnyMap> result = AnyMap::make(swiftPart.getCount());
  // TODO: Actually convert
  return result;
}

SwiftAnyMap toSwift(const std::shared_ptr<AnyMap>& cppAnyMap) {
  std::unordered_map<std::string, AnyValue>& map = cppAnyMap->getMap();
  NitroModules::AnyMap result = NitroModules::AnyMap::init(map.size());
  // TODO: Actually convert
  return SwiftAnyMap(result);
}

}
