//
//  NativeNitroModules.h
//  NitroModules
//
//  Created by Marc Rousavy on 07.10.24.
//

// RCTModuleRegistry + the moduleRegistry property that RN injects into bridge modules.
#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED

// New Architecture uses the Codegen'd Spec (TurboModule)
#import <NitroModulesSpec/NitroModulesSpec.h>
@interface NativeNitroModules : NSObject <NativeNitroModulesSpec>
@property (nonatomic, weak) RCTModuleRegistry *moduleRegistry;
/// The RCTModuleRegistry RN injected into this module, captured so any Nitro
/// HybridObject can reach sibling RN modules on iOS (analog of Android's applicationContext).
+ (nullable RCTModuleRegistry *)sharedModuleRegistry;
@end

#else

// Old Architecture is an untyped RCTBridgeModule
@interface NativeNitroModules : NSObject <RCTBridgeModule>
@property (nonatomic, weak) RCTModuleRegistry *moduleRegistry;
/// See above.
+ (nullable RCTModuleRegistry *)sharedModuleRegistry;
@end

#endif
