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
import { NitroConfig } from '../../config/NitroConfig.js'
import { getUmbrellaHeaderName } from '../../autolinking/ios/createSwiftUmbrellaHeader.js'
import { getHybridObjectName } from '../../syntax/getHybridObjectName.js'
import { indent } from '../../utils.js'

export function createSwiftHybridViewManager(
  spec: HybridObjectSpec
): SourceFile[] {
  const cppFiles = createViewComponentShadowNodeFiles(spec)
  const namespace = NitroConfig.getCxxNamespace('c++')
  const swiftNamespace = NitroConfig.getIosModuleName()
  const { HybridTSpecSwift, HybridTSpecCxx } = getHybridObjectName(spec.name)
  const { component, descriptorClassName, propsClassName } =
    getViewComponentNames(spec)
  const autolinking = NitroConfig.getAutolinkedHybridObjects()
  const viewImplementation = autolinking[spec.name]?.swift
  if (viewImplementation == null) {
    throw new Error(
      `Cannot create Swift HybridView ViewManager for ${spec.name} - it is not autolinked in nitro.json!`
    )
  }

  const propAssignments = spec.properties.map((p) => {
    const name = escapeCppName(p.name)
    return `
if (newViewProps.${name}.isDirty) {
  swiftPart.${p.cppSetterName}(newViewProps.${name}.value);
  newViewProps.${name}.isDirty = false;
}
`.trim()
  })

  const mmFile = `
${createFileMetadataString(`${component}.mm`)}

#import "${component}.hpp"
#include <NitroModules/NitroDefines.hpp>
#if REACT_NATIVE_VERSION_MINOR >= 78

#import <memory>
#import <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#import <React/RCTViewComponentView.h>
#import <React/RCTComponentViewFactory.h>
#import <React/UIView+ComponentViewProtocol.h>
#import <UIKit/UIKit.h>
#import <NitroModules/HybridObjectRegistry.hpp>

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
    std::shared_ptr<HybridObject> hybridView = HybridObjectRegistry::createHybridObject("${spec.name}");
    _hybridView = std::dynamic_pointer_cast<${HybridTSpecSwift}>(hybridView);
    if (_hybridView == nullptr) [[unlikely]] {
      throw std::runtime_error("Failed to create HybridObject \\"${spec.name}\\" - it is not an instance of \`${HybridTSpecSwift}\`!");
    }
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

- (void) updateProps:(const react::Props::Shared&)props
            oldProps:(const react::Props::Shared&)oldProps {
  // 1. Downcast props
  const auto& newViewPropsConst = *std::static_pointer_cast<${propsClassName} const>(props);
  auto& newViewProps = const_cast<${propsClassName}&>(newViewPropsConst);
  ${swiftNamespace}::${HybridTSpecCxx}& swiftPart = _hybridView->getSwiftPart();

  // 2. Update each prop
  swiftPart.beforeUpdate();

  ${indent(propAssignments.join('\n'), '  ')}

  swiftPart.afterUpdate();

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
