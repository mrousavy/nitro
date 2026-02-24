//
//  HybridNitroModulesProxy.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 05.10.24
//

#include "HybridNitroModulesProxy.hpp"
#include "HybridObjectRegistry.hpp"
#include "HybridViewRegistry.hpp"
#include "JSIConverter.hpp"
#include "NitroDefines.hpp"

namespace margelo::nitro {

void HybridNitroModulesProxy::loadHybridMethods() {
  HybridObject::loadHybridMethods();

  registerHybrids(this, [](Prototype& prototype) {
    prototype.registerHybridMethod("createHybridObject", &HybridNitroModulesProxy::createHybridObject);
    prototype.registerHybridMethod("hasHybridObject", &HybridNitroModulesProxy::hasHybridObject);
    prototype.registerRawHybridMethod("isHybridObject", 1, &HybridNitroModulesProxy::isHybridObject);
    prototype.registerHybridMethod("getAllHybridObjectNames", &HybridNitroModulesProxy::getAllHybridObjectNames);

    prototype.registerHybridMethod("getViewProps", &HybridNitroModulesProxy::getViewProps);

    prototype.registerHybridMethod("box", &HybridNitroModulesProxy::box);
    prototype.registerHybridMethod("updateMemorySize", &HybridNitroModulesProxy::updateMemorySize);

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

// Hybrid Views
std::vector<std::string> HybridNitroModulesProxy::getViewProps(const std::string& viewName) {
  const HybridViewInfo& viewInfo = HybridViewRegistry::getHybridViewInfo(viewName);
  return viewInfo.propNames;
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

jsi::Value HybridNitroModulesProxy::isHybridObject(jsi::Runtime& runtime, const jsi::Value&, const jsi::Value* args, size_t size) {
  if (size != 1 || !args[0].isObject()) {
    return false;
  }
  jsi::Object object = args[0].getObject(runtime);
  if (!object.hasNativeState(runtime)) {
    return false;
  }
  std::shared_ptr<jsi::NativeState> nativeState = object.getNativeState(runtime);
  std::shared_ptr<HybridObject> maybeHybridObject = std::dynamic_pointer_cast<HybridObject>(nativeState);
  bool isHybrid = maybeHybridObject != nullptr;
  return jsi::Value(isHybrid);
}

std::shared_ptr<HybridObject> HybridNitroModulesProxy::updateMemorySize(const std::shared_ptr<HybridObject>& hybridObject) {
  // If a hybridObject goes from Native -> JS, it will update its memory size internally (in `HybridObject::toObject(..)`).
  // This is all that function does.
  return hybridObject;
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
