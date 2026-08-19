//
// Created by Marc Rousavy on 19.08.26.
//

#pragma once

#include <memory>
#include <utility>
#include <react/renderer/core/ConcreteComponentDescriptor.h>

namespace margelo::nitro {

using namespace facebook;

template <typename TShadowNode>
class ViewComponentDescriptor final: public react::ConcreteComponentDescriptor<TShadowNode> {
  using Base = react::ConcreteComponentDescriptor<TShadowNode>;
  using Props = typename TShadowNode::ConcreteProps;
  using State = typename TShadowNode::ConcreteStateData;
  
public:
  explicit ViewComponentDescriptor(const react::ComponentDescriptorParameters& parameters)
  : Base(parameters, react::RawPropsParser()) {}

public:
  /**
   * A faster path for cloning props - reuses the caching logic from the `Props`.
   */
  std::shared_ptr<const react::Props> cloneProps(const react::PropsParserContext& context,
                                                 const std::shared_ptr<const react::Props>& props,
                                                 react::RawProps rawProps) const override {
    // 1. Prepare raw props parser
    rawProps.parse(this->rawPropsParser_);
    // 2. Copy props with Nitro's cached copy constructor
    return TShadowNode::Props(context, /* & */ rawProps, props);
  }
  
#ifdef ANDROID
  void adopt(react::ShadowNode& shadowNode) const override {
    // This is called immediately after `ShadowNode` is created, cloned or in progress.
    // On Android, we need to wrap props in our state, which gets routed through Java and later unwrapped in JNI/C++.
    auto& concreteShadowNode = static_cast<TShadowNode&>(shadowNode);
    const std::shared_ptr<const TShadowNode::Props>& constProps = concreteShadowNode.getConcreteSharedProps();
    const std::shared_ptr<TShadowNode::Props>& props = std::const_pointer_cast<TShadowNode::Props>(constProps);
    TShadowNode::State state{props};
    concreteShadowNode.setStateData(std::move(state));
  }
#endif
};



} // namespace margelo::nitro
