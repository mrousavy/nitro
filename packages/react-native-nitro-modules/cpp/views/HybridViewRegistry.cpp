//
//  HybridViewRegistry.cpp
//  Nitro
//
//  Created by Marc Rousavy on 04.02.26.
//

#include "HybridViewRegistry.hpp"

namespace margelo::nitro {

std::unordered_map<std::string, HybridViewInfo> HybridViewRegistry::_views;

void HybridViewRegistry::registerHybridView(const std::string& viewName, HybridViewInfo&& viewInfo) {
  if (_views.contains(viewName)) {
    throw std::runtime_error("Tried to register HybridView \"" + viewName + "\" twice!");
  }
  _views.emplace(viewName, std::move(viewInfo));
}

const HybridViewInfo& HybridViewRegistry::getHybridViewInfo(const std::string& viewName) {
  auto found = _views.find(viewName);
  if (found == _views.end()) {
    throw std::runtime_error("No HybridView is registered under the name \"" + viewName + "\"!");
  }
  return found->second;
}

} // namespace margelo::nitro
