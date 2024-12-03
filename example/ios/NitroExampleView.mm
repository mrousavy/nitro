#import <UIKit/UIKit.h>
#import <react/renderer/componentregistry/ComponentDescriptorRegistry.h>
#import <React/RCTComponentViewFactory.h>
#import <React/UIView+ComponentViewProtocol.h>

#import <react/renderer/core/ConcreteComponentDescriptor.h>
#import <react/renderer/components/view/ConcreteViewShadowNode.h>
#import <react/renderer/components/view/ViewProps.h>
#import <react/renderer/core/PropsParserContext.h>
#import <react/renderer/components/view/ViewEventEmitter.h>
#import <React/RCTViewComponentView.h>
#import <jsi/jsi.h>

using namespace facebook;
using namespace facebook::react;


// We have to inherit from ViewProps so that we can
class CustomViewProps final : public ViewProps {
public:
  CustomViewProps() = default;
  CustomViewProps(const PropsParserContext& context, const CustomViewProps &sourceProps, const RawProps &rawProps): ViewProps(context, sourceProps, rawProps) {
    if (rawProps.isEmpty()) {
      return;
    }

    const RawValue* raw = rawProps.at("nativeProp", nullptr, nullptr);
    const auto& [runtime, value] = raw->experimental_getJsiValuePair();
    nativeProp = value.asString(*runtime).utf8(*runtime);
  }

  std::string nativeProp;
};

class CustomViewState {
public:
  CustomViewState() = default;
};

extern const char CustomViewComponentName[] = "CustomView";
using ComponentShadowNode = ConcreteViewShadowNode<
  CustomViewComponentName,
  CustomViewProps,
  ViewEventEmitter, // default one
  CustomViewState
>;
using CustomViewComponentDescriptor = ConcreteComponentDescriptor<ComponentShadowNode>;

@interface ManualFabricComponentView : RCTViewComponentView //UIView <RCTComponentViewProtocol>

@end

@implementation ManualFabricComponentView

// Adds the component to the known components
+(void)load
{
  [RCTComponentViewFactory.currentComponentViewFactory registerComponentViewClass:[ManualFabricComponentView class]];
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<CustomViewComponentDescriptor>();
}

- (void)updateProps:(const facebook::react::Props::Shared &)props oldProps:(const facebook::react::Props::Shared &)oldProps {
  const auto &newViewProps = *std::static_pointer_cast<CustomViewProps const>(props);
  NSLog(@"NativeProp value: %s", newViewProps.nativeProp.c_str());

  [super updateProps:props oldProps:oldProps];
}

@end
