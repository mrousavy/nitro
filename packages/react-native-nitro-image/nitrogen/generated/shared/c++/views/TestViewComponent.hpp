///
/// TestViewComponent.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include "NitroDefines.hpp"

#if REACT_NATIVE_VERSION >= 78

#include "NitroHash.hpp"
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/view/ViewProps.h>

namespace margelo::nitro::image::views {

  using namespace facebook;

  /**
   * The name of the actual native View.
   */
  extern const char HybridTestViewComponentName[] = "HybridTestView";

  /**
   * Props for the "TestView" View.
   */
  class HybridTestViewProps: public react::ViewProps {
  public:
    explicit HybridTestViewProps() = default;
    HybridTestViewProps(const react::PropsParserContext& context,
                        const HybridTestViewProps& sourceProps,
                        const react::RawProps& rawProps);

  public:
    bool someProp;
    std::function<void(double /* someParam */)> someCallback;

  private:
    static bool filterObjectKeys(const std::string& propName);
  };

  /**
   * State for the "TestView" View.
   */
  class HybridTestViewState {
  public:
    explicit HybridTestViewState() = default;
  };

  /**
   * The Shadow Node for the "TestView" View.
   */
  using HybridTestViewShadowNode = react::ConcreteViewShadowNode<HybridTestViewComponentName, HybridTestViewProps, react::ViewEventEmitter, HybridTestViewState>;

  /**
   * The Component Descriptor for the "TestView" View.
   */
  class HybridTestViewComponentDescriptor: public react::ConcreteComponentDescriptor<HybridTestViewShadowNode> {
  public:
    HybridTestViewComponentDescriptor(const react::ComponentDescriptorParameters& parameters);

  public:
    void adopt(react::ShadowNode& shadowNode) const override;
  };

  /* The actual view for "TestView" needs to be implemented in platform-specific code. */

} // namespace margelo::nitro::image::views

#else
  #warning "View Component 'HybridTestView' will be unavailable in React Native, because it requires React Native 78 or higher."
#endif
