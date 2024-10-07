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

using namespace facebook;
using namespace margelo;

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
    // 1. Cast RCTBridge to a RCTCxxBridge (ObjC)
    RCTCxxBridge* cxxBridge = (RCTCxxBridge*)RCTBridge.currentBridge;
    if (!cxxBridge) {
      return @"RCTBridge is not a RCTCxxBridge!";
    }
    
    // 2. Access jsi::Runtime and cast from void*
    jsi::Runtime* runtime = reinterpret_cast<jsi::Runtime*>(cxxBridge.runtime);
    if (!runtime) {
      return @"jsi::Runtime on RCTCxxBridge was null!";
    }
    
    // 3. Access react::CallInvoker
    std::shared_ptr<react::CallInvoker> callInvoker = cxxBridge.jsCallInvoker;
    if (!callInvoker) {
      return @"react::CallInvoker on RCTCxxBridge was null!";
    }
    
    // 4. Wrap react::CallInvoker in nitro::Dispatcher
    auto dispatcher = std::make_shared<nitro::CallInvokerDispatcher>(callInvoker);
    
    // 5. Install Nitro
    nitro::install(*runtime, dispatcher);
    return nil;
  } catch (std::runtime_error& error) {
    return [NSString stringWithCString:error.what() encoding:kCFStringEncodingUTF8];
  }
}

@end

#endif
