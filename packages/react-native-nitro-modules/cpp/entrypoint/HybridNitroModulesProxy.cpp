//
//  HybridNitroModulesProxy.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 05.10.24
//

#include "HybridNitroModulesProxy.hpp"
#include "HybridObjectRegistry.hpp"
#include "NitroDefines.hpp"

namespace margelo::nitro {

void HybridNitroModulesProxy::loadHybridMethods() {
  HybridObject::loadHybridMethods();

  registerHybrids(this, [](Prototype& prototype) {
    prototype.registerHybridMethod("createHybridObject", &HybridNitroModulesProxy::createHybridObject);
    prototype.registerHybridMethod("hasHybridObject", &HybridNitroModulesProxy::hasHybridObject);
    prototype.registerHybridMethod("getAllHybridObjectNames", &HybridNitroModulesProxy::getAllHybridObjectNames);

    prototype.registerHybridMethod("box", &HybridNitroModulesProxy::box);

    prototype.registerHybridGetter("buildType", &HybridNitroModulesProxy::getBuildType);
  });
}

// Hybrid Object Registry
std::shared_ptr<HybridObject> HybridNitroModulesProxy::createHybridObject(const std::string& name) {
  return HybridObjectRegistry::createHybridObject(name);
}

bool HybridNitroModulesProxy::hasHybridObject(const std::string& name) {
  return HybridObjectRegistry::hasHybridObject(name);
}

std::vector<std::string> HybridNitroModulesProxy::getAllHybridObjectNames() {
  return HybridObjectRegistry::getAllHybridObjectNames();
}

// Helpers
std::shared_ptr<BoxedHybridObject> HybridNitroModulesProxy::box(const std::shared_ptr<HybridObject>& hybridObject) {
  return std::make_shared<BoxedHybridObject>(hybridObject);
}

// Build Info
std::string HybridNitroModulesProxy::getBuildType() {
#ifdef NITRO_DEBUG
  return "debug";
#else
  return "release";
#endif
}

} // namespace margelo::nitro
