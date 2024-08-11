//
//  NitroImageOnLoad.mm
//  NitroImage
//
//  Created by Marc Rousavy on 22.07.24.
//

#import "HybridImageFactorySpecSwift.hpp"
#import "HybridSwiftKotlinTestObjectSpecSwift.hpp"
#import "HybridTestObject.hpp"
#import <Foundation/Foundation.h>
#import <NitroModules/HybridObjectRegistry.hpp>

namespace NitroImage {
class NitroImageRegistry;
} // namespace NitroImage

#import "NitroImage-Swift.h"

@interface NitroImageOnLoad : NSObject
@end

@implementation NitroImageOnLoad

using namespace margelo::nitro;

+ (void)load {
  HybridObjectRegistry::registerHybridObjectConstructor("ImageFactory", []() -> std::shared_ptr<HybridObject> {
    auto imageFactory = NitroImage::NitroImageRegistry::createImageFactory();
    return std::make_shared<HybridImageFactorySpecSwift>(imageFactory);
  });
  HybridObjectRegistry::registerHybridObjectConstructor("SwiftKotlinTestObject", []() -> std::shared_ptr<HybridObject> {
    auto testObject = NitroImage::NitroImageRegistry::createSwiftKotlinTestObject();
    return std::make_shared<HybridSwiftKotlinTestObjectSpecSwift>(testObject);
  });
  HybridObjectRegistry::registerHybridObjectConstructor(
      "TestObject", []() -> std::shared_ptr<HybridObject> { return std::make_shared<HybridTestObject>(); });
}

@end
