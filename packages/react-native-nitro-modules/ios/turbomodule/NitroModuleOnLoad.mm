//
//  NitroModuleOnLoad.mm
//  DoubleConversion
//
//  Created by Marc Rousavy on 21.06.24.
//

#import <Foundation/Foundation.h>
#import "RegisterNativeNitroModules.hpp"

@interface NitroModulesOnLoad : NSObject
@end

@implementation NitroModulesOnLoad

+ (void)load {
  // When this Objective-C class is loaded, it registers the CxxTurboModule in the react module system.
  // We need Objective-C here because these things do not get compiled out - meaning this will always be
  // called when the app starts.
  margelo::RegisterNativeNitroModules::registerNativeNitroModules();
}

@end
