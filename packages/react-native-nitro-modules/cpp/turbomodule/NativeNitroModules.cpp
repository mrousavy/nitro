//
//  NativeNitroModules.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#include "NativeNitroModules.hpp"
#include "BoxedHybridObject.hpp"
#include "CallInvokerDispatcher.hpp"
#include "Dispatcher.hpp"
#include "HybridObjectRegistry.hpp"
#include "NitroDefines.hpp"

namespace facebook::react {

using namespace margelo::nitro;

NativeNitroModules::NativeNitroModules(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeNitroModulesCxxSpec(jsInvoker), _callInvoker(jsInvoker) {}

NativeNitroModules::~NativeNitroModules() {}

// Setup
void NativeNitroModules::install(jsi::Runtime& runtime) {
  // Installs the global Dispatcher mechanism into this Runtime.
  // This allows creating Promises and calling back to JS.
  auto dispatcher = std::make_shared<CallInvokerDispatcher>(_callInvoker);
  Dispatcher::installRuntimeGlobalDispatcher(runtime, dispatcher);
}

jsi::String NativeNitroModules::getBuildType(jsi::Runtime& runtime) {
#ifdef NITRO_DEBUG
    return jsi::String::createFromAscii(runtime, "debug");
#else
    return jsi::String::createFromAscii(runtime, "release");
#endif
}

// Creating Hybrid Objects
jsi::Object NativeNitroModules::createHybridObject(jsi::Runtime& runtime, jsi::String name) {
  auto hybridObjectName = name.utf8(runtime);
  auto hybridObject = HybridObjectRegistry::createHybridObject(hybridObjectName);
  return hybridObject->toObject(runtime).getObject(runtime);
}

bool NativeNitroModules::hasHybridObject(jsi::Runtime& runtime, jsi::String name) {
  std::string hybridObjectName = name.utf8(runtime);
  bool exists = HybridObjectRegistry::hasHybridObject(hybridObjectName);
  return exists;
}

jsi::Array NativeNitroModules::getAllHybridObjectNames(jsi::Runtime& runtime) {
  std::vector<std::string> keys = HybridObjectRegistry::getAllHybridObjectNames();
  jsi::Array array(runtime, keys.size());
  for (size_t i = 0; i < keys.size(); i++) {
    array.setValueAtIndex(runtime, i, jsi::String::createFromUtf8(runtime, keys[i]));
  }
  return array;
}

// Boxing
jsi::Object NativeNitroModules::box(jsi::Runtime& runtime, jsi::Object object) {
#ifdef NITRO_DEBUG
  if (!object.hasNativeState(runtime)) {
    std::string stringified = jsi::Value(runtime, object).toString(runtime).utf8(runtime);
    throw std::runtime_error("Cannot box object " + stringified + " - it does not have a NativeState!");
  }
#endif

  std::shared_ptr<jsi::NativeState> nativeState = object.getNativeState(runtime);
  std::shared_ptr<HybridObject> maybeHybridObject = std::dynamic_pointer_cast<HybridObject>(nativeState);
  if (maybeHybridObject == nullptr) {
    std::string stringified = jsi::Value(runtime, object).toString(runtime).utf8(runtime);
    throw std::runtime_error("Cannot box object " + stringified + " - it has a NativeState, but it's not a HybridObject!");
  }

  auto boxed = std::make_shared<BoxedHybridObject>(maybeHybridObject);
  return jsi::Object::createFromHostObject(runtime, boxed);
}

// NativeState Helpers
bool NativeNitroModules::hasNativeState(jsi::Runtime& runtime, jsi::Object object) {
  bool has = object.hasNativeState(runtime) && object.getNativeState(runtime) != nullptr;
  return has;
}

void NativeNitroModules::removeNativeState(jsi::Runtime& runtime, jsi::Object object) {
  object.setNativeState(runtime, nullptr);
}

} // namespace facebook::react
