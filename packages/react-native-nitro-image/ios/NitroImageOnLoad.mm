//
//  NitroImageOnLoad.mm
//  NitroImage
//
//  Created by Marc Rousavy on 22.07.24.
//


namespace NitroImage {
class ImageSpecCxx;
class ImageFactorySpecCxx;
}

#import "ImageSize.hpp"

#import <Foundation/Foundation.h>
#import <NitroModules/HybridObjectRegistry.hpp>
#import "NitroImage-Swift.h"
#import "HybridImageFactorySwift.hpp"

@interface NitroImageOnLoad : NSObject
@end

@implementation NitroImageOnLoad

using namespace margelo::nitro;

+ (void)load {
  // Register Test HybridObject so it can be created from JS.
  HybridObjectRegistry::registerHybridObjectConstructor("ImageFactory", []() -> std::shared_ptr<HybridObject> {
    auto imageFactory = NitroImage::NitroImageRegistry::createImageFactory();
    return std::make_shared<HybridImageFactorySwift>(imageFactory);
  });
}

@end
