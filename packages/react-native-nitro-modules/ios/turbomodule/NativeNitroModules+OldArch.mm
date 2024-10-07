//
//  NativeNitroModules+OldArch.mm
//  DoubleConversion
//
//  Created by Marc Rousavy on 21.06.24.
//

#import "NativeNitroModules.h"

#ifndef RCT_NEW_ARCH_ENABLED

#import "InstallNitro.hpp"
#import "CallInvokerDispatcher.hpp"

#import <React/RCTBridge+Private.h>
#import <React/RCTBridge.h>

// forward-declaration (private API)
@interface RCTBridge (JSIRuntime)
- (void*)runtime;
- (std::shared_ptr<react::CallInvoker>)jsCallInvoker;
@end

/**
 * NativeNitroModules implementation for the old architecture.
 * This uses `RCTBridge` to grab the `jsi::Runtime` and `react::CallInvoker`.
 */
@implementation NativeNitroModules
RCT_EXPORT_MODULE(NitroModules)

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(install) {
  try {
    
    margelo::nitro::install(runtime, )
  } catch (std::runtime_error& error) {
    
  }
}

@end

#endif
