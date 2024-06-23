//
//  NativeNitroModules.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

#if __has_include(<React-Codegen/NitroModulesSpecJSI.h>)
// CocoaPods include (iOS)
#include <React-Codegen/NitroModulesSpecJSI.h>
#elif __has_include(<NitroModulesSpecJSI.h>)
// CMake include on Android
#include <NitroModulesSpecJSI.h>
#else
#error Cannot find react-native-nitro-modules spec! Try cleaning your cache and re-running CodeGen!
#endif

namespace facebook::react {

// The base C++-based TurboModule. This is the entry point where all nitro modules get initialized.
class NativeNitroModules : public NativeNitroCxxSpec<NativeNitroModules> {
public:
  NativeNitroModules(std::shared_ptr<CallInvoker> jsInvoker);
  ~NativeNitroModules();

  void install(jsi::Runtime& runtime);
  jsi::Object createTestHybridObject(jsi::Runtime& runtime);
  jsi::Object createSwiftTestHybridObject(jsi::Runtime& runtime);
  
private:
  std::shared_ptr<CallInvoker> _callInvoker;
};

} // namespace facebook::react
