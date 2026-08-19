//
// Created by Marc Rousavy on 19.08.26.
//

#pragma once

#include "NitroDefines.hpp"
#include <memory>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <utility>

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
#ifdef ANDROID
  using State = typename TShadowNode::ConcreteStateData;
  using ConcreteState = typename TShadowNode::ConcreteState;
#endif

public:
  explicit ViewComponentDescriptor(const react::ComponentDescriptorParameters& parameters) : Base(parameters) {}

#ifdef ANDROID
  react::State::Shared createInitialState(const react::Props::Shared& props,
                                          const react::ShadowNodeFamily::Shared& family) const override {
    auto concreteProps = std::static_pointer_cast<const Props>(props);
    auto data = std::make_shared<const State>(concreteProps);
    return std::make_shared<ConcreteState>(data, family);
  }

  void adopt(react::ShadowNode& shadowNode) const override {
    Base::adopt(shadowNode);

    // This is called immediately after `ShadowNode` is created, cloned or in progress.
    // On Android, we need to wrap props in our state, which gets routed through Java and later unwrapped in JNI/C++.
    auto& concreteShadowNode = static_cast<TShadowNode&>(shadowNode);
    auto props = std::static_pointer_cast<const Props>(shadowNode.getProps());
    const std::shared_ptr<const Props>& previousProps = concreteShadowNode.getStateData().getProps();
    if (previousProps != nullptr && props->hasSameProps(*previousProps)) {
      // None of the Nitro props changed. Keep the existing State identity so
      // Fabric does not schedule an Android State update for base View props.
      return;
    }

    State state{props};
    concreteShadowNode.setStateData(std::move(state));
  }
#endif
};

} // namespace margelo::nitro
