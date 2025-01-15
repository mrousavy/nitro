import type { SourceFile } from '../../syntax/SourceFile.js'
import type { HybridObjectSpec } from '../../syntax/HybridObjectSpec.js'
import {
  createViewComponentShadowNodeFiles,
  getViewComponentNames,
} from '../ViewComponentShadowNode.js'
import { createFileMetadataString } from '../../syntax/helpers.js'
import { NitroConfig } from '../../config/NitroConfig.js'

export function createSwiftHybridViewManager(
  spec: HybridObjectSpec
): SourceFile[] {
  const cppFiles = createViewComponentShadowNodeFiles(spec)
  const namespace = NitroConfig.getCxxNamespace('c++', 'views')
  const { component, descriptorClassName, propsClassName } =
    getViewComponentNames(spec)
  const autolinking = NitroConfig.getAutolinkedHybridObjects()
  const viewImplementation = autolinking[spec.name]?.swift
  if (viewImplementation == null) {
    throw new Error(
      `Cannot create Swift HybridView ViewManager for ${spec.name} - it is not autolinked in nitro.json!`
    )
  }

  const mmFile = `
${createFileMetadataString(`${component}.mm`)}

#if REACT_NATIVE_VERSION >= 78

#import "${component}.hpp"
#import <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#import <React/RCTViewComponentView.h>
#import <React/RCTComponentViewFactory.h>
#import <React/UIView+ComponentViewProtocol.h>
#import <UIKit/UIKit.h>

using namespace facebook;

/**
 * Represents the React Native View holder for the Nitro "${spec.name}" HybridView.
 */
@interface ${component}: RCTViewComponentView
@end

@implementation ${component}

+ (void) load {
  [super load];
  // TODO: Register it!
}

+ (react::ComponentDescriptorProvider) componentDescriptorProvider {
  return react::concreteComponentDescriptorProvider<${namespace}::${descriptorClassName}>();
}

- (instancetype) init {
  // TODO: Initialize "${viewImplementation}" view!
}

- (void) updateProps:(const react::Props::Shared&)props
            oldProps:(const react::Props::Shared&)oldProps {
  // TODO: const auto& newViewProps = *std::static_pointer_cast<${namespace}::${propsClassName} const>(props);

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
