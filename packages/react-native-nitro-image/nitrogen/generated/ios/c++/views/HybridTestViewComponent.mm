///
/// HybridTestViewComponent.mm
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#if REACT_NATIVE_VERSION >= 78

#import "HybridTestViewComponent.hpp"
#import <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#import <React/RCTViewComponentView.h>
#import <React/RCTComponentViewFactory.h>
#import <React/UIView+ComponentViewProtocol.h>
#import <UIKit/UIKit.h>

using namespace facebook;

/**
 * Represents the React Native View holder for the Nitro "TestView" HybridView.
 */
@interface HybridTestViewComponent: RCTViewComponentView
@end

@implementation HybridTestViewComponent

+ (void) load {
  [super load];
  // TODO: Register it!
}

+ (react::ComponentDescriptorProvider) componentDescriptorProvider {
  return react::concreteComponentDescriptorProvider<margelo::nitro::image::views::HybridTestViewComponentDescriptor>();
}

- (instancetype) init {
  if (self = [super init]) {
    // TODO: Initialize "HybridTestView" view!
  }
  return self;
}

- (void) updateProps:(const react::Props::Shared&)props
            oldProps:(const react::Props::Shared&)oldProps {
  // TODO: const auto& newViewProps = *std::static_pointer_cast<margelo::nitro::image::views::HybridTestViewProps const>(props);

  [super updateProps:props oldProps:oldProps];
}

@end

#endif
