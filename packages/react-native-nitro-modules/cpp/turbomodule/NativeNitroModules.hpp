//
//  NativeNitroModules.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

#include <ReactCodegen/NitroModulesJSI.h>

namespace facebook::react {

using namespace facebook;

// The base C++-based TurboModule. This is the entry point where all nitro modules get initialized.
class NativeNitroModules : public NativeNitroModulesCxxSpec<NativeNitroModules> {
public:
  NativeNitroModules(std::shared_ptr<CallInvoker> jsInvoker);
  ~NativeNitroModules();

public:
  // Setup
  void install(jsi::Runtime& runtime);
  jsi::String getBuildType(jsi::Runtime& rt);

  // Creating Hybrid Objects
  jsi::Object createHybridObject(jsi::Runtime& rt, jsi::String name);
  bool hasHybridObject(jsi::Runtime& rt, jsi::String name);
  jsi::Array getAllHybridObjectNames(jsi::Runtime& rt);

  // Boxing
  jsi::Object box(jsi::Runtime& rt, jsi::Object obj);

  // NativeState Helpers
  bool hasNativeState(jsi::Runtime& rt, jsi::Object obj);
  void removeNativeState(jsi::Runtime& rt, jsi::Object obj);

public:
  constexpr static auto kModuleName = "NitroModulesCxx";

private:
  std::shared_ptr<CallInvoker> _callInvoker;
};

} // namespace facebook::react
