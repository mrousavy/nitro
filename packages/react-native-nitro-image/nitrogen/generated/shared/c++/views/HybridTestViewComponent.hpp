///
/// HybridTestViewComponent.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include <optional>
#include <NitroModules/NitroDefines.hpp>
#include <NitroModules/NitroHash.hpp>
#include <NitroModules/CachedProp.hpp>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/view/ViewProps.h>

#include <functional>

namespace margelo::nitro::image::views {

  using namespace facebook;

  /**
   * The name of the actual native View.
   */
  extern const char HybridTestViewComponentName[];

  /**
   * Props for the "TestView" View.
   */
  class HybridTestViewProps final: public react::ViewProps {
  public:
    HybridTestViewProps() = default;
    HybridTestViewProps(const HybridTestViewProps&);
    HybridTestViewProps(const react::PropsParserContext& context,
                        const HybridTestViewProps& sourceProps,
                        const react::RawProps& rawProps);

  public:
    CachedProp<bool> isBlue;
    CachedProp<std::function<void()>> someCallback;

  private:
    static bool filterObjectKeys(const std::string& propName);
  };

  /**
   * State for the "TestView" View.
   */
  class HybridTestViewState final {
  public:
    HybridTestViewState() = default;

  public:
    void setProps(const HybridTestViewProps& props) { _props.emplace(props); }
    const std::optional<HybridTestViewProps>& getProps() const { return _props; }

  public:
#ifdef ANDROID
  HybridTestViewState(const HybridTestViewState& /* previousState */, folly::dynamic /* data */) {}
  folly::dynamic getDynamic() const {
    throw std::runtime_error("HybridTestViewState does not support folly!");
  }
  react::MapBuffer getMapBuffer() const {
    throw std::runtime_error("HybridTestViewState does not support MapBuffer!");
  };
#endif

  private:
    std::optional<HybridTestViewProps> _props;
  };

  /**
   * The Shadow Node for the "TestView" View.
   */
  using HybridTestViewShadowNode = react::ConcreteViewShadowNode<HybridTestViewComponentName /* "HybridTestView" */,
                                                                 HybridTestViewProps /* custom props */,
                                                                 react::ViewEventEmitter /* default */,
                                                                 HybridTestViewState /* custom state */>;

  /**
   * The Component Descriptor for the "TestView" View.
   */
  class HybridTestViewComponentDescriptor final: public react::ConcreteComponentDescriptor<HybridTestViewShadowNode> {
  public:
    HybridTestViewComponentDescriptor(const react::ComponentDescriptorParameters& parameters);

  public:
    /**
     * A faster path for cloning props - reuses the caching logic from `HybridTestViewProps`.
     */
    react::Props::Shared cloneProps(const react::PropsParserContext& context,
                                    const react::Props::Shared& props,
                                    react::RawProps rawProps) const override;
#ifdef ANDROID
    void adopt(react::ShadowNode& shadowNode) const override;
#endif
  };

  /* The actual view for "TestView" needs to be implemented in platform-specific code. */

} // namespace margelo::nitro::image::views
