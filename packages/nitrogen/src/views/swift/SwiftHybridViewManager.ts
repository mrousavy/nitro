import type { SourceFile } from '../../syntax/SourceFile.js'
import type { HybridObjectSpec } from '../../syntax/HybridObjectSpec.js'
import {
  createViewComponentShadowNodeFiles,
  getViewComponentNames,
} from '../ViewComponentShadowNode.js'
import {
  createFileMetadataString,
  escapeCppName,
} from '../../syntax/helpers.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import { getUmbrellaHeaderName } from '../../autolinking/ios/createSwiftUmbrellaHeader.js'
import { getHybridObjectName } from '../../syntax/getHybridObjectName.js'
import { getHybridObjectConstructorCall } from '../../syntax/swift/SwiftHybridObjectRegistration.js'
import { indent } from '../../utils.js'

export function createSwiftHybridViewManager(
  spec: HybridObjectSpec
): SourceFile[] {
  const cppFiles = createViewComponentShadowNodeFiles(spec)
  const namespace = NitroConfig.getCxxNamespace('c++')
  const swiftNamespace = NitroConfig.getIosModuleName()
  const { HybridTSpec, HybridTSpecSwift, HybridTSpecCxx } = getHybridObjectName(
    spec.name
  )
  const { component, descriptorClassName, propsClassName } =
    getViewComponentNames(spec)
  const autolinking = NitroConfig.getAutolinkedHybridObjects()
  const viewImplementation = autolinking[spec.name]?.swift
  if (viewImplementation == null) {
    throw new Error(
      `Cannot create Swift HybridView ViewManager for ${spec.name} - it is not autolinked in nitro.json!`
    )
  }

  const propAssignments = spec.properties.map(
    (p) =>
      `swiftPart.${p.cppSetterName}(newViewProps.${escapeCppName(p.name)});`
  )

  const mmFile = `
${createFileMetadataString(`${component}.mm`)}

#if REACT_NATIVE_VERSION >= 78

#import "${component}.hpp"
#import <memory>
#import <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#import <React/RCTViewComponentView.h>
#import <React/RCTComponentViewFactory.h>
#import <React/UIView+ComponentViewProtocol.h>
#import <UIKit/UIKit.h>

#import "${HybridTSpecSwift}.hpp"
#import "${getUmbrellaHeaderName()}"

using namespace facebook;
using namespace ${namespace};
using namespace ${namespace}::views;

/**
 * Represents the React Native View holder for the Nitro "${spec.name}" HybridView.
 */
@interface ${component}: RCTViewComponentView
@end

@implementation ${component} {
  std::shared_ptr<${HybridTSpecSwift}> _hybridView;
}

+ (void) load {
  [super load];
  [RCTComponentViewFactory.currentComponentViewFactory registerComponentViewClass:[${component} class]];
}

+ (react::ComponentDescriptorProvider) componentDescriptorProvider {
  return react::concreteComponentDescriptorProvider<${descriptorClassName}>();
}

- (instancetype) init {
  if (self = [super init]) {
    std::shared_ptr<${HybridTSpec}> hybridView = ${getHybridObjectConstructorCall(spec.name)}
    _hybridView = std::dynamic_pointer_cast<${HybridTSpecSwift}>(hybridView);
    [self updateView];
  }
  return self;
}

- (void) updateView {
  ${swiftNamespace}::${HybridTSpecCxx}& swiftPart = _hybridView->getSwiftPart();
  void* viewUnsafe = swiftPart.getView();
  UIView* view = (__bridge_transfer UIView*) viewUnsafe;
  [self setContentView:view];
}

- (void) updateProps:(const react::Props::Shared&)props
            oldProps:(const react::Props::Shared&)oldProps {
  // 1. Downcast props
  const auto& newViewProps = *std::static_pointer_cast<${propsClassName} const>(props);
  ${swiftNamespace}::${HybridTSpecCxx}& swiftPart = _hybridView->getSwiftPart();
  // 2. Update each prop
  ${indent(propAssignments.join('\n'), '  ')}
  // 3. Continue in base class
  [super updateProps:props oldProps:oldProps];
}

@end

#endif
  `

  return [
    ...cppFiles,
    {
      content: mmFile,
      language: 'c++',
      name: `${component}.mm`,
      platform: 'ios',
      subdirectory: ['views'],
    },
  ]
}
