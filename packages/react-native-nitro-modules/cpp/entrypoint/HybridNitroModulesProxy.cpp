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

    prototype.registerRawHybridMethod("hasNativeState", 1, &HybridNitroModulesProxy::hasNativeState);

    prototype.registerHybridGetter("buildType", &HybridNitroModulesProxy::getBuildType);
    prototype.registerHybridGetter("version", &HybridNitroModulesProxy::getVersion);
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

jsi::Value HybridNitroModulesProxy::hasNativeState(jsi::Runtime& runtime, const jsi::Value&, const jsi::Value* args, size_t size) {
  if (size != 1 || !args[0].isObject()) {
    return false;
  }
  return args[0].getObject(runtime).hasNativeState(runtime);
}

// Build Info
std::string HybridNitroModulesProxy::getBuildType() {
#ifdef NITRO_DEBUG
  return "debug";
#else
  return "release";
#endif
}

std::string HybridNitroModulesProxy::getVersion() {
  return NITRO_VERSION;
}

} // namespace margelo::nitro
