///
/// HybridTestViewComponent.cpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#include "HybridTestViewComponent.hpp"
#include <NitroModules/JSIConverter.hpp>

#if REACT_NATIVE_VERSION >= 78

namespace margelo::nitro::image::views {

  HybridTestViewProps::HybridTestViewProps(const react::PropsParserContext& context,
                                           const HybridTestViewProps& sourceProps,
                                           const react::RawProps& rawProps):
    react::ViewProps(context, sourceProps, rawProps, filterObjectKeys),
    /* someProp */ someProp([&](){
      const react::RawValue* rawValue = rawProps.at("someProp", nullptr, nullptr);
      if (rawValue == nullptr) { throw std::runtime_error("TestView: Prop \"someProp\" is required and cannot be undefined!"); }
      const auto& [runtime, value] = (std::pair<jsi::Runtime*, const jsi::Value&>)*rawValue;
      return JSIConverter<bool>::fromJSI(*runtime, value);
    }()),
    /* someCallback */ someCallback([&](){
      const react::RawValue* rawValue = rawProps.at("someCallback", nullptr, nullptr);
      if (rawValue == nullptr) { throw std::runtime_error("TestView: Prop \"someCallback\" is required and cannot be undefined!"); }
      const auto& [runtime, value] = (std::pair<jsi::Runtime*, const jsi::Value&>)*rawValue;
      return JSIConverter<std::function<void(double /* someParam */)>>::fromJSI(*runtime, value);
    }()) {
    // TODO: Instead of eagerly converting each prop, only convert the ones that changed on demand.
  }

  HybridTestViewProps::HybridTestViewProps(const HybridTestViewProps& other):
    react::ViewProps(),
    someProp(other.someProp),
    someCallback(other.someCallback) {}

  bool HybridTestViewProps::filterObjectKeys(const std::string& propName) {
    switch (hashString(propName)) {
      case hashString("someProp"): return true;
      case hashString("someCallback"): return true;
      default: return false;
    }
  }

  HybridTestViewComponentDescriptor::HybridTestViewComponentDescriptor(const react::ComponentDescriptorParameters& parameters)
    : ConcreteComponentDescriptor(parameters,
                                  std::make_unique<react::RawPropsParser>(/* enableJsiParser */ true)) {}

  void HybridTestViewComponentDescriptor::adopt(react::ShadowNode& shadowNode) const {
    // This is called immediately after `ShadowNode` is created, cloned or in progress.
#ifdef ANDROID
    // On Android, we need to wrap props in our state, which gets routed through Java and later unwrapped in JNI/C++.
    auto& concreteShadowNode = static_cast<HybridTestViewShadowNode&>(shadowNode);
    const HybridTestViewProps& props = concreteShadowNode.getConcreteProps();
    HybridTestViewState state;
    state.setProps(props);
    concreteShadowNode.setStateData(std::move(state));
#else
    // On iOS, prop updating happens through the updateProps: Obj-C selector.
#endif
  }

} // namespace margelo::nitro::image::views

#endif
