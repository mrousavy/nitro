//
//  NitroImageOnLoad.mm
//  NitroImage
//
//  Created by Marc Rousavy on 22.07.24.
//

#import <Foundation/Foundation.h>
#import <NitroModules/HybridObjectRegistry.hpp>

@interface NitroImageOnLoad : NSObject
@end

@implementation NitroImageOnLoad

+ (void)load {
  // When this Objective-C class is loaded, it registers the HybridObjects
  // in the Nitro Module Hybrid Object registry.
  margelo::nitro::HybridObjectRegistry()::registerNativeNitroModules();
}

@end
