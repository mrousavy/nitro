//
// Created by Marc Rousavy on 19.08.26.
//

#pragma once

#include <concepts>
#include <cxxreact/ReactNativeVersion.h>
#include <memory>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <string_view>
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
  static_assert(std::constructible_from<State, const std::shared_ptr<const Props>&>,
                "TShadowNode::ConcreteStateData must be constructible from "
                "const std::shared_ptr<const TShadowNode::ConcreteProps>& on Android.");
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
    if (!props && rawProps.isEmpty()) {
      return TShadowNode::defaultSharedProps();
    }

    if constexpr (react::RawPropsFilterable<TShadowNode>) {
      TShadowNode::filterRawProps(rawProps);
    }

#if REACT_NATIVE_VERSION_MAJOR != 0 || REACT_NATIVE_VERSION_MINOR >= 87
    if constexpr (react::HasIteratorSetterCtor<Props>) {
      // Copy the previous immutable snapshot, then apply only the keys present
      // in this RawProps patch. This keeps Nitro's JSI-backed RawValues intact.
      auto shadowNodeProps = TShadowNode::Props(props);

#ifdef RN_SERIALIZABLE_STATE
      TShadowNode::initializeDynamicProps(shadowNodeProps, rawProps, props);
#endif

      rawProps.forEachItem([&](std::string_view name, const react::RawValue& value) {
        shadowNodeProps->setProp(context, RAW_PROPS_KEY_HASH(name), name.data(), value);
      });
      return shadowNodeProps;
    }
#endif

    // React Native 0.79 through 0.86, and generated Props without an iterator
    // setter, keep using Nitro's JSI-backed three-argument constructor.
    rawProps.parse(this->rawPropsParser_);
    return TShadowNode::Props(context, /* & */ rawProps, props);
  }

#ifdef ANDROID
  void adopt(react::ShadowNode& shadowNode) const override {
    Base::adopt(shadowNode);

    // This is called immediately after `ShadowNode` is created, cloned or in progress.
    // On Android, we need to wrap props in our state, which gets routed through Java and later unwrapped in JNI/C++.
    auto& concreteShadowNode = static_cast<TShadowNode&>(shadowNode);
    // Start from the stable shared pointer stored by ShadowNode. Some React Native versions implement
    // `getConcreteSharedProps()` by returning a reference to a temporary cast result.
    auto constBaseProps = concreteShadowNode.getProps();
    auto constProps = std::static_pointer_cast<const Props>(constBaseProps);
    const std::shared_ptr<const Props>& previousProps = concreteShadowNode.getStateData().getProps();
    if (previousProps != nullptr && constProps->hasSameProps(*previousProps)) {
      // None of the Nitro props changed. Keep the existing State identity so
      // Fabric does not schedule an Android State update for base View props.
      return;
    }

    State state{std::move(constProps)};
    concreteShadowNode.setStateData(std::move(state));
  }
#endif
};

} // namespace margelo::nitro
