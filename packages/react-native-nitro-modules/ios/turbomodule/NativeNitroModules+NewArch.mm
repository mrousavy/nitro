//
//  NativeNitroModules+NewArch.mm
//  react-native-nitro
//
//  Created by Marc Rousavy on 21.06.24.
//

#import "NativeNitroModules.h"

#ifdef RCT_NEW_ARCH_ENABLED

#import "CallInvokerDispatcher.hpp"
#import "InstallNitro.hpp"

#import <ReactCommon/CallInvoker.h>
#import <ReactCommon/RCTTurboModuleWithJSIBindings.h>

using namespace facebook;
using namespace margelo;

// Make NativeNitroModules comply to RCTTurboModuleWithJSIBindings
@interface NativeNitroModules () <RCTTurboModuleWithJSIBindings>
@end

/**
 * NativeNitroModules implementation for the new architecture.
 * This uses `installJSIBindingsWithRuntime:` to install the `global.NitroModulesProxy` into the JS Runtime.
 */
@implementation NativeNitroModules {
  bool _didInstall;
  std::weak_ptr<react::CallInvoker> _callInvoker;
}
RCT_EXPORT_MODULE(NitroModules)

- (void)installJSIBindingsWithRuntime:(jsi::Runtime&)runtime {
  // 1. Get CallInvoker we cached statically
  auto callInvoker = _callInvoker.lock();
  if (callInvoker == nullptr) {
    throw std::runtime_error("Cannot install global.NitroModulesProxy - CallInvoker was null!");
  }

  // 2. Wrap CallInvoker as Dispatcher
  auto dispatcher = std::make_shared<nitro::CallInvokerDispatcher>(callInvoker);

  // 3. Install Nitro
  nitro::install(runtime, dispatcher);
  _didInstall = true;
}

- (NSString*)install {
  if (_didInstall) {
    // installJSIBindingsWithRuntime ran successfully.
    return nil;
  } else {
    return @"installJSIBindingsWithRuntime: was not called - JSI Bindings could not be installed!";
  }
}

- (std::shared_ptr<react::TurboModule>)getTurboModule:(const react::ObjCTurboModule::InitParams&)params {
  // Cache the CallInvoker statically (weak) - we use it later in `installJSIBindingsWithRuntime:`.
  _callInvoker = params.jsInvoker;
  return std::make_shared<react::NativeNitroModulesSpecJSI>(params);
}

@end

#endif
