//
//  NativeNitroModules.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

#include <ReactCommon/TurboModule.h>

namespace facebook::react {

using namespace facebook;

// The base C++-based TurboModule. This is the entry point where all nitro modules get initialized.
class NativeNitroModules : public TurboModule {
public:
  NativeNitroModules(std::shared_ptr<CallInvoker> jsInvoker);
  ~NativeNitroModules();

public:
  jsi::Value get(jsi::Runtime& runtime, const jsi::PropNameID& propName) override;

  // Setup
  void install(jsi::Runtime& runtime);
  // Hybrid Objects stuff
  jsi::Value createHybridObject(jsi::Runtime& runtime, const jsi::String& hybridObjectName);
  jsi::Value hasHybridObject(jsi::Runtime& runtime, const jsi::String& hybridObjectName);
  jsi::Value getAllHybridObjectNames(jsi::Runtime& runtime);

public:
  constexpr static auto kModuleName = "NitroModulesCxx";

private:
  std::shared_ptr<CallInvoker> _callInvoker;
};

} // namespace facebook::react
