#import <React/RCTComponentViewFactory.h>
#import <React/UIView+ComponentViewProtocol.h>
#import <UIKit/UIKit.h>
#import <react/renderer/componentregistry/ComponentDescriptorRegistry.h>

#import <React/RCTViewComponentView.h>
#import <jsi/jsi.h>
#import <react/renderer/components/view/ConcreteViewShadowNode.h>
#import <react/renderer/components/view/ViewEventEmitter.h>
#import <react/renderer/components/view/ViewProps.h>
#import <react/renderer/core/ConcreteComponentDescriptor.h>
#import <react/renderer/core/PropsParserContext.h>

#import "HybridTestObjectCppSpec.hpp"
//#import "JSIConverter.hpp"

// for prop conversion
#import <react/renderer/core/propsConversions.h>


using namespace facebook;
using namespace facebook::react;
using namespace margelo::nitro;

// We have to inherit from ViewProps so that we can
class CustomViewProps final : public ViewProps {
public:
  CustomViewProps() = default;
  CustomViewProps(const PropsParserContext& context, const CustomViewProps& sourceProps, const RawProps& rawProps)
      : ViewProps(context, sourceProps, rawProps) {
        if (rawProps.isEmpty()) {
          // There is some code path in RawPropsParser.cpp where we expect to collect all possible keys (prop names) upfront
          // during the init phase. Calling this .at() method while the rawProps is empty, will cause this prop value to be indexed …
          // Otherwise we'd get a crash when trying to access it later.
          // We should really also try to merge the PR i have for providing alternative RawProps parser !!
          rawProps.at("nativeProp", nullptr, nullptr);
          return;
        }
    
        const RawValue* rawValue = rawProps.at("nativeProp", nullptr, nullptr);
        // Option 1: Manually cast it
        const auto& [runtime, value] = (std::pair<jsi::Runtime*, const jsi::Value&>)*rawValue;
        std::shared_ptr<HybridTestObjectCppSpec> prop = margelo::nitro::JSIConverter<std::shared_ptr<HybridTestObjectCppSpec>>::fromJSI(*runtime, value);
        auto test = prop;
  }

  std::shared_ptr<HybridTestObjectCppSpec> nativeProp;
};

class CustomViewState {
public:
  CustomViewState() = default;
};

extern const char CustomViewComponentName[] = "CustomView";
using ComponentShadowNode = ConcreteViewShadowNode<CustomViewComponentName, CustomViewProps,
                                                   ViewEventEmitter, // default one
                                                   CustomViewState>;

class CustomViewComponentDescriptor : public ConcreteComponentDescriptor<ComponentShadowNode> {
public:
  CustomViewComponentDescriptor(const ComponentDescriptorParameters& parameters)
  // Construct a new RawPropsParser to which we pass true which enables JSI prop parsing
  : ConcreteComponentDescriptor(parameters, std::make_unique<RawPropsParser>(true)) {}
};


@interface ManualFabricComponentView : RCTViewComponentView // UIView <RCTComponentViewProtocol>

@end

@implementation ManualFabricComponentView

// Adds the component to the known components
+ (void)load {
  [RCTComponentViewFactory.currentComponentViewFactory registerComponentViewClass:[ManualFabricComponentView class]];
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<CustomViewComponentDescriptor>();
}

- (void)updateProps:(const facebook::react::Props::Shared&)props oldProps:(const facebook::react::Props::Shared&)oldProps {
  const auto& newViewProps = *std::static_pointer_cast<CustomViewProps const>(props);
  //  NSLog(@"NativeProp value: %s", newViewProps.nativeProp.c_str());

  [super updateProps:props oldProps:oldProps];
}

@end
