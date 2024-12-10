//
// Created by Hanno Gödecke on 10.12.2024.
//

#pragma once

#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/view/ViewEventEmitter.h>
#include <react/renderer/components/view/ViewProps.h>
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/StateData.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>

#include "HybridTestObjectCppSpec.hpp"


using namespace facebook;
using namespace facebook::react;
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
        std::shared_ptr<HybridTestObjectCppSpec> prop = margelo::nitro::JSIConverter<std::shared_ptr<HybridTestObjectCppSpec>>::fromJSI(*runtime, value);
        nativeProp = prop;
    }

    std::shared_ptr<HybridTestObjectCppSpec> nativeProp = nullptr;
};

extern const char CustomViewComponentName[] = "CustomView";
using ComponentShadowNode = ConcreteViewShadowNode<
        CustomViewComponentName,
        CustomViewProps,
        ViewEventEmitter, // default one
        StateData>;

class CustomViewComponentDescriptor : public ConcreteComponentDescriptor<ComponentShadowNode> {
public:
    CustomViewComponentDescriptor(const ComponentDescriptorParameters& parameters)
    // Construct a new RawPropsParser to which we pass true which enables JSI prop parsing
            : ConcreteComponentDescriptor(parameters, std::make_unique<RawPropsParser>(true)) {}
};
