///
/// HybridTestViewComponent.mm
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#import "HybridTestViewComponent.hpp"
#import <memory>
#import <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#import <React/RCTViewComponentView.h>
#import <React/RCTComponentViewFactory.h>
#import <React/UIView+ComponentViewProtocol.h>
#import <NitroModules/NitroDefines.hpp>
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
  // 1. Get Swift part
  NitroImage::HybridTestViewSpec_cxx& swiftPart = _hybridView->getSwiftPart();

  // 2. Get UIView*
  void* viewUnsafe = swiftPart.getView();
  UIView* view = (__bridge_transfer UIView*) viewUnsafe;

  // 3. Update RCTViewComponentView's [contentView]
  [self setContentView:view];
}

- (void) updateProps:(const react::Props::Shared&)props
            oldProps:(const react::Props::Shared&)oldProps {
  // 1. Downcast props
  const auto& newViewPropsConst = *std::static_pointer_cast<HybridTestViewProps const>(props);
  auto& newViewProps = const_cast<HybridTestViewProps&>(newViewPropsConst);
  NitroImage::HybridTestViewSpec_cxx& swiftPart = _hybridView->getSwiftPart();

  // 2. Update each prop individually
  swiftPart.beforeUpdate();

  // isBlue: boolean
  if (newViewProps.isBlue.isDirty) {
    swiftPart.setIsBlue(newViewProps.isBlue.value);
    newViewProps.isBlue.isDirty = false;
  }
  // colorScheme: enum
  if (newViewProps.colorScheme.isDirty) {
    swiftPart.setColorScheme(static_cast<int>(newViewProps.colorScheme.value));
    newViewProps.colorScheme.isDirty = false;
  }
  // someCallback: function
  if (newViewProps.someCallback.isDirty) {
    swiftPart.setSomeCallback(newViewProps.someCallback.value);
    newViewProps.someCallback.isDirty = false;
  }

  swiftPart.afterUpdate();

  // 3. Update hybridRef if it changed
  if (newViewProps.hybridRef.isDirty) {
    // hybridRef changed - call it with new this
    const auto& maybeFunc = newViewProps.hybridRef.value;
    if (maybeFunc.has_value()) {
      maybeFunc.value()(_hybridView);
    }
    newViewProps.hybridRef.isDirty = false;
  }

  // 4. Continue in base class
  [super updateProps:props oldProps:oldProps];
}

@end
