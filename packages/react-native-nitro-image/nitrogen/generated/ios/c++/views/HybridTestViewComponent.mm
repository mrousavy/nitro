///
/// HybridTestViewComponent.mm
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#if REACT_NATIVE_VERSION >= 78

#import "HybridTestViewComponent.hpp"
#import <memory>
#import <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#import <React/RCTViewComponentView.h>
#import <React/RCTComponentViewFactory.h>
#import <React/UIView+ComponentViewProtocol.h>
#import <UIKit/UIKit.h>

#import "HybridTestViewSpecSwift.hpp"
#import "NitroImage-Swift-Cxx-Umbrella.hpp"

using namespace facebook;
using namespace margelo::nitro::image;
using namespace margelo::nitro::image::views;

/**
 * Represents the React Native View holder for the Nitro "TestView" HybridView.
 */
@interface HybridTestViewComponent: RCTViewComponentView
@end

@implementation HybridTestViewComponent {
  std::shared_ptr<HybridTestViewSpecSwift> _hybridView;
}

+ (void) load {
  [super load];
  [RCTComponentViewFactory.currentComponentViewFactory registerComponentViewClass:[HybridTestViewComponent class]];
}

+ (react::ComponentDescriptorProvider) componentDescriptorProvider {
  return react::concreteComponentDescriptorProvider<HybridTestViewComponentDescriptor>();
}

- (instancetype) init {
  if (self = [super init]) {
    std::shared_ptr<HybridTestViewSpec> hybridView = NitroImage::NitroImageAutolinking::createTestView();
    _hybridView = std::dynamic_pointer_cast<HybridTestViewSpecSwift>(hybridView);
    [self updateView];
  }
  return self;
}

- (void) updateView {
  NitroImage::HybridTestViewSpec_cxx& swiftPart = _hybridView->getSwiftPart();
  void* viewUnsafe = swiftPart.getView();
  UIView* view = (__bridge_transfer UIView*) viewUnsafe;
  [self setContentView:view];
}

- (void) updateProps:(const react::Props::Shared&)props
            oldProps:(const react::Props::Shared&)oldProps {
  // 1. Downcast props
  const auto& newViewProps = *std::static_pointer_cast<HybridTestViewProps const>(props);
  NitroImage::HybridTestViewSpec_cxx& swiftPart = _hybridView->getSwiftPart();
  // 2. Update each prop
  swiftPart.setSomeProp(newViewProps.someProp);
  swiftPart.setSomeCallback(newViewProps.someCallback);
  // 3. Continue in base class
  [super updateProps:props oldProps:oldProps];
}

@end

#endif
