//
//  HybridViewRegistry.cpp
//  Nitro
//
//  Created by Marc Rousavy on 04.02.26.
//

#include "HybridViewRegistry.hpp"

namespace margelo::nitro {


std::unordered_map<std::string, HybridViewInfo>& HybridViewRegistry::getHybridViewsRegistry() {
  static std::unordered_map<std::string, HybridViewInfo> registry;
  return registry;
}

void HybridViewRegistry::registerHybridView(const std::string& viewName, HybridViewInfo&& viewInfo) {
  auto& registry = getHybridViewsRegistry();
  if (registry.contains(viewName)) {
    throw std::runtime_error("Tried to register HybridView \"" + viewName + "\" twice!");
  }
  registry.emplace(viewName, std::move(viewInfo));
}

const HybridViewInfo& HybridViewRegistry::getHybridViewInfo(const std::string& viewName) {
  auto& registry = getHybridViewsRegistry();
  auto found = registry.find(viewName);
  if (found == registry.end()) {
    throw std::runtime_error("No HybridView is registered under the name \"" + viewName + "\"!");
  }
  return found->second;
}

} // namespace margelo::nitro
