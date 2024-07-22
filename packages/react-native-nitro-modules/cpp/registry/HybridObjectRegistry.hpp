//
//  HybridObjectRegistry.hpp
//  DoubleConversion
//
//  Created by Marc Rousavy on 22.07.24.
//

#pragma once

#include "HybridObject.hpp"
#include <functional>
#include <string>

namespace margelo::nitro {

class HybridObjectRegistry {
public:
  HybridObjectRegistry() = delete;
  
public:
  using HybridObjectConstructorFn = std::function<std::shared_ptr<HybridObject>()>;
  
public:
  static void registerHybridObjectConstructor(std::string hybridObjectName,
                                              HybridObjectConstructorFn&& constructorFn);
  
  static std::shared_ptr<HybridObject> createHybridObject(std::string hybridObjectName);
  
private:
  static std::unordered_map<std::string, HybridObjectConstructorFn>& getRegistry();
};

} // namespace margelo::nitro
