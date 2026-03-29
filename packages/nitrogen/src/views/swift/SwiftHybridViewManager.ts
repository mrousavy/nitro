import type { SourceFile } from '../../syntax/SourceFile.js'
import type { HybridObjectSpec } from '../../syntax/HybridObjectSpec.js'
import {
  createViewComponentShadowNodeFiles,
  getViewComponentNames,
} from '../CppHybridViewComponent.js'
import {
  createFileMetadataString,
  escapeCppName,
} from '../../syntax/helpers.js'
import { getUmbrellaHeaderName } from '../../autolinking/ios/createSwiftUmbrellaHeader.js'
import { getHybridObjectName } from '../../syntax/getHybridObjectName.js'
import {
  getHybridObjectConstructorCall,
  getIsRecyclableCall,
} from '../../syntax/swift/SwiftHybridObjectRegistration.js'
import { indent } from '../../utils.js'
import { SwiftCxxBridgedType } from '../../syntax/swift/SwiftCxxBridgedType.js'

export function createSwiftHybridViewManager(
  spec: HybridObjectSpec
): SourceFile[] {
  const cppFiles = createViewComponentShadowNodeFiles(spec)
  const namespace = spec.config.getCxxNamespace('c++')
  const swiftNamespace = spec.config.getIosModuleName()
  const { HybridTSpec, HybridTSpecSwift, HybridTSpecCxx } = getHybridObjectName(
    spec.name
  )
  const { component, descriptorClassName, propsClassName } =
    getViewComponentNames(spec)
  const implementation = spec.config.getIosAutolinkedImplementation(spec.name)
  if (implementation?.language !== 'swift') {
    throw new Error(
      `Cannot create Swift HybridView ViewManager for ${spec.name} - it must be autolinked with a Swift iOS implementation in nitro.json!`
    )
  }

  const propAssignments = spec.properties.map((p) => {
    const name = escapeCppName(p.name)
    const setter = p.getSetterName('swift')
    const bridge = new SwiftCxxBridgedType(p.type, false)
    const parse = bridge.parseFromCppToSwift(
      `newViewProps.${name}.value`,
      'c++'
    )
    return `
// ${p.jsSignature}
if (newViewProps.${name}.isDirty) {
  swiftPart.${setter}(${indent(parse, '  ')});
  newViewProps.${name}.isDirty = false;
}
`.trim()
  })

  const mmFile = `
${createFileMetadataString(`${component}.mm`)}

#import <${swiftNamespace}/${component}.hpp>
#import <memory>
#import <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#import <React/RCTViewComponentView.h>
#import <React/RCTComponentViewFactory.h>
#import <React/UIView+ComponentViewProtocol.h>
#import <NitroModules/NitroDefines.hpp>
#import <UIKit/UIKit.h>

#import <${swiftNamespace}/${HybridTSpecSwift}.hpp>
#import "${getUmbrellaHeaderName()}"

#if __has_include(<cxxreact/ReactNativeVersion.h>)
#include <cxxreact/ReactNativeVersion.h>
#if REACT_NATIVE_VERSION_MINOR >= 82
#define ENABLE_RCT_COMPONENT_VIEW_INVALIDATE
#endif
#endif

using namespace facebook;
using namespace ${namespace};
using namespace ${namespace}::views;

/**
 * Represents the React Native View holder for the Nitro "${spec.name}" HybridView.
 */
@interface ${component}: RCTViewComponentView
+ (BOOL)shouldBeRecycled;
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
  // 1. Get Swift part
  ${swiftNamespace}::${HybridTSpecCxx}& swiftPart = _hybridView->getSwiftPart();

  // 2. Get UIView*
  void* viewUnsafe = swiftPart.getView();
  UIView* view = (__bridge_transfer UIView*) viewUnsafe;

  // 3. Update RCTViewComponentView's [contentView]
  [self setContentView:view];
}

- (void) updateProps:(const std::shared_ptr<const react::Props>&)props
            oldProps:(const std::shared_ptr<const react::Props>&)oldProps {
  // 1. Downcast props
  const auto& newViewPropsConst = *std::static_pointer_cast<${propsClassName} const>(props);
  auto& newViewProps = const_cast<${propsClassName}&>(newViewPropsConst);
  ${swiftNamespace}::${HybridTSpecCxx}& swiftPart = _hybridView->getSwiftPart();

  // 2. Update each prop individually
  swiftPart.beforeUpdate();

  ${indent(propAssignments.join('\n'), '  ')}

  swiftPart.afterUpdate();

  // 3. Update hybridRef if it changed
  if (newViewProps.hybridRef.isDirty) {
    // hybridRef changed - call it with new this
    const auto& maybeFunc = newViewProps.hybridRef.value;
    if (maybeFunc.has_value()) {
      maybeFunc.value()(_hybridView);
    }
    newViewProps.hybridRef.isDirty = false;
  }

  // 4. Continue in base class
  [super updateProps:props oldProps:oldProps];
}

+ (BOOL)shouldBeRecycled {
  return ${getIsRecyclableCall(spec.name)}
}

- (void)prepareForRecycle {
  [super prepareForRecycle];
  ${swiftNamespace}::${HybridTSpecCxx}& swiftPart = _hybridView->getSwiftPart();
  swiftPart.maybePrepareForRecycle();
}

#ifdef ENABLE_RCT_COMPONENT_VIEW_INVALIDATE
- (void)invalidate {
  ${swiftNamespace}::${HybridTSpecCxx}& swiftPart = _hybridView->getSwiftPart();
  swiftPart.onDropView();
  [super invalidate];
}
#endif

@end
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
