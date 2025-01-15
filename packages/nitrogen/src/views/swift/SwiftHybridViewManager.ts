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
  const { component, descriptorClassName } = getViewComponentNames(spec)

  const mmFile = `
${createFileMetadataString(`${component}.mm`)}

#if REACT_NATIVE_VERSION >= 78

#import "${component}.hpp"
#import <React/RCTComponentViewFactory.h>
#import <React/UIView+ComponentViewProtocol.h>
#import <UIKit/UIKit.h>

namespace ${namespace} {

  @interface ${component}: RCTViewComponentView
  @end

  @implementation ${component}
  + (void) load {
    // TODO: Register it!
  }

  + (ComponentDescriptorProvider)componentDescriptorProvider {
    return concreteComponentDescriptorProvider<${descriptorClassName}>();
  }

  - (void)updateProps:(const facebook::react::Props::Shared&)props
             oldProps:(const facebook::react::Props::Shared&)oldProps {
    // TODO: const auto& newViewProps = *std::static_pointer_cast<CustomViewProps const>(props);

    [super updateProps:props oldProps:oldProps];
  }
  @end

} // namespace ${namespace}

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
