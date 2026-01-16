//
//  SwiftConverter+AnyMap.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 16.01.26.
//

#include "SwiftConverter+AnyMap.hpp"
#include "NitroModules-Swift.h"

namespace margelo::nitro {

std::shared_ptr<AnyMap> SwiftConverter<std::shared_ptr<AnyMap>>::fromSwift(NitroModules::AnyMap& swiftAnyMap) {
  auto anyMap = AnyMap::make(swiftAnyMap.getCount());
  // TODO: Convert Swift -> C++
  return anyMap;
}

NitroModules::AnyMap SwiftConverter<std::shared_ptr<AnyMap>>::toSwift(const std::shared_ptr<AnyMap>& cppAnyMap) {
  std::vector<std::string> keys = cppAnyMap->getAllKeys();
  auto swiftPart = NitroModules::AnyMap::init(keys.size());
  // TODO: Convert C++ -> Swift
  return swiftPart;
}

}
