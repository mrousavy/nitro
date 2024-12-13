//
// Created by Hanno Gödecke on 10.12.2024.
//

#pragma once

#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/view/ViewEventEmitter.h>
#include <react/renderer/components/view/ViewProps.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/StateData.h>

//#include "HybridTestObjectCppSpec.hpp"
#include "HybridTestObjectSwiftKotlinSpec.hpp"

namespace facebook::react {
using namespace margelo::nitro;

// We have to inherit from ViewProps so that we can
class CustomViewProps final : public ViewProps {
public:
  CustomViewProps() = default;

  CustomViewProps(const PropsParserContext& context, const CustomViewProps& sourceProps, const RawProps& rawProps)
      : ViewProps(context, sourceProps, rawProps) {
    const RawValue* rawValue = rawProps.at("nativeProp", nullptr, nullptr);
    if (rawValue == nullptr) {
      return;
    }

    // Option 1: Manually cast it
    const auto& [runtime, value] = (std::pair<jsi::Runtime*, const jsi::Value&>)*rawValue;
    std::shared_ptr<HybridTestObjectSwiftKotlinSpec> prop =
        margelo::nitro::JSIConverter<std::shared_ptr<HybridTestObjectSwiftKotlinSpec>>::fromJSI(*runtime, value);
    nativeProp = prop;
  }

  std::shared_ptr<HybridTestObjectSwiftKotlinSpec> nativeProp = nullptr;
};

// Use StateData to retain native jsi values on android
struct JSI_EXPORT CustomStateData final {
  using Shared = std::shared_ptr<const CustomStateData>;

  //    CustomStateData() = default;

  std::shared_ptr<HybridTestObjectSwiftKotlinSpec> nativeProp = nullptr;

#ifdef ANDROID

  CustomStateData() = default;

  CustomStateData(const CustomStateData& previousState, folly::dynamic data) {}

  folly::dynamic getDynamic() const {
    folly::dynamic test = folly::dynamic::object;
    test["nativeProp"] = 12;
    return test;
  }

  MapBuffer getMapBuffer() const {
    return MapBufferBuilder::EMPTY();
  };
#endif
};

JSI_EXPORT extern const char CustomViewComponentName[];

class ComponentShadowNode : public ConcreteViewShadowNode<CustomViewComponentName, CustomViewProps,
                                                          ViewEventEmitter, // default one
                                                          CustomStateData> {

public:
  ComponentShadowNode(const ShadowNodeFragment& fragment, const ShadowNodeFamily::Shared& family, ShadowNodeTraits traits)
      : ConcreteViewShadowNode(fragment, family, traits) {
    // ==== Flow needed for android ====
    // We store the props in a state wrapper. There is no way to convert back
    // to the underlying c++ props from java, as these have been converted to folly::dynamic very early on.
    // However state wrapper is a fbjni Hybrid which we can use to pass data back and forth between java and c++.

    // Cast to our prop type
    const auto& props = *std::static_pointer_cast<CustomViewProps const>(fragment.props);

    // Update our props
    // TODO: does that really work on every prop update?
    CustomStateData stateData{};
    stateData.nativeProp = props.nativeProp;

    // Update our state to reflect our props state
    setStateData(std::move(stateData));
  }

  ComponentShadowNode(const ShadowNode& sourceShadowNode, const ShadowNodeFragment& fragment)
      : ConcreteViewShadowNode(sourceShadowNode, fragment) {}
};

class CustomViewComponentDescriptor : public ConcreteComponentDescriptor<ComponentShadowNode> {
public:
  CustomViewComponentDescriptor(const ComponentDescriptorParameters& parameters)
      // Construct a new RawPropsParser to which we pass true which enables JSI prop parsing
      : ConcreteComponentDescriptor(parameters, std::make_unique<RawPropsParser>(true)) {}
};
} // namespace facebook::react