//
//  NativeNitroModules.h
//  NitroModules
//
//  Created by Marc Rousavy on 07.10.24.
//

#ifdef RCT_NEW_ARCH_ENABLED
#import "NitroModulesSpec.h"
@interface NativeNitroModules : NSObject <NativeNitroModulesSpec>
#else
#import <React/RCTBridgeModule.h>
@interface NativeNitroModules : NSObject <RCTBridgeModule>
#endif

@end
