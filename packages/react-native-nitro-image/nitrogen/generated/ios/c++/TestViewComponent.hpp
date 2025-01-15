///
/// TestViewComponent.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#import <react/renderer/core/PropsParserContext.h>
#import <react/renderer/components/view/ViewProps.h>
#import <react/renderer/components/view/ConcreteViewShadowNode.h>

namespace margelo::nitro::image {

  using namespace facebook;

  class HybridTestViewProps: public react::ViewProps {
  public:
    explicit HybridTestViewProps() = default;
    HybridTestViewProps(const react::PropsParserContext& context,
                      const HybridTestViewProps& sourceProps,
                      const react::RawProps& rawProps): react::ViewProps(context, sourceProps, rawProps) {
      throw std::runtime_error("not yet implemented!");
    }
  };

  class HybridTestViewState {
  public:
    explicit HybridTestViewState() = default;
  };

  extern const char HybridTestViewComponentName[] = "HybridTestView";
  using HybridTestViewShadowNode = react::ConcreteViewShadowNode<HybridTestViewComponentName, HybridTestViewProps, react::ViewEventEmitter, HybridTestViewState>;

  class HybridTestViewComponentDescriptor: public react::ConcreteComponentDescriptor<HybridTestViewShadowNode> {
  public:
    HybridTestViewComponentDescriptor(const react::ComponentDescriptorParameters& parameters)
      : ConcreteComponentDescriptor(parameters, std::make_unique<RawPropsParser>(/* enable raw JSI props parsing */ true)) {}
  };

  // TODO: Actual RCTViewComponentView goes here... or in Swift?

} // namespace margelo::nitro::image
