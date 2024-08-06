//
//  NitroModuleOnLoad.mm
//  DoubleConversion
//
//  Created by Marc Rousavy on 21.06.24.
//

#import "HybridObjectRegistry.hpp"
#import "RegisterNativeNitroModules.hpp"
#import <Foundation/Foundation.h>

@interface NitroModulesOnLoad : NSObject
@end

@implementation NitroModulesOnLoad

using namespace margelo::nitro;

+ (void)load {
  // When this Objective-C class is loaded, it registers the CxxTurboModule in the react module system.
  // We need Objective-C here because these things do not get compiled out - meaning this will always be
  // called when the app starts.
  RegisterNativeNitroModules::registerNativeNitroModules();
}

@end
