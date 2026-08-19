//
// Created by Marc Rousavy on 19.08.26.
//

#pragma once

#include <concepts>
#include <cxxreact/ReactNativeVersion.h>
#include <memory>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <utility>

#if REACT_NATIVE_VERSION_MAJOR != 0 || REACT_NATIVE_VERSION_MINOR >= 85
// Since React Native 0.85, the RawPropsParser has JSI Parsing always enabled
// by default, and the boolean argument has been removed.
#define RAW_PROPS_PARSER_USES_JSI_BY_DEFAULT
#endif

namespace margelo::nitro {

using namespace facebook;

/**
 * A `react::ConcreteComponentDescriptor` implementation for a Nitro View.
 *
 * Requires the `TShadowNode` to be a `react::ShadowNode` composited of `Props`
 * which support Raw Props Parsing, and `State` which supports holding `Props`
 * for direct transfer to JNI on Android.
 */
template <typename TShadowNode>
class ViewComponentDescriptor final : public react::ConcreteComponentDescriptor<TShadowNode> {
  using Base = react::ConcreteComponentDescriptor<TShadowNode>;
  using Props = typename TShadowNode::ConcreteProps;
  using State = typename TShadowNode::ConcreteStateData;

#ifdef ANDROID
  static_assert(std::constructible_from<State, const std::shared_ptr<Props>&>,
                "TShadowNode::ConcreteStateData must be constructible from "
                "const std::shared_ptr<TShadowNode::ConcreteProps>& on Android.");
#endif

public:
#ifdef RAW_PROPS_PARSER_USES_JSI_BY_DEFAULT
  explicit ViewComponentDescriptor(const react::ComponentDescriptorParameters& parameters) : Base(parameters, react::RawPropsParser()) {}
#else
  explicit ViewComponentDescriptor(const react::ComponentDescriptorParameters& parameters)
      : Base(parameters, react::RawPropsParser(true)) {}
#endif

public:
  /**
   * A faster path for cloning props - reuses the caching logic from the `Props`.
   */
  std::shared_ptr<const react::Props> cloneProps(const react::PropsParserContext& context, const std::shared_ptr<const react::Props>& props,
                                                 react::RawProps rawProps) const override {
    // 1. Prepare raw props parser
    rawProps.parse(this->rawPropsParser_);
    // 2. Copy props with Nitro's cached copy constructor
    return TShadowNode::Props(context, /* & */ rawProps, props);
  }

#ifdef ANDROID
  void adopt(react::ShadowNode& shadowNode) const override {
    Base::adopt(shadowNode);

    // This is called immediately after `ShadowNode` is created, cloned or in progress.
    // On Android, we need to wrap props in our state, which gets routed through Java and later unwrapped in JNI/C++.
    auto& concreteShadowNode = static_cast<TShadowNode&>(shadowNode);
    const std::shared_ptr<const Props>& constProps = concreteShadowNode.getConcreteSharedProps();
    const std::shared_ptr<Props>& props = std::const_pointer_cast<Props>(constProps);
    State state{props};
    concreteShadowNode.setStateData(std::move(state));
  }
#endif
};

} // namespace margelo::nitro
