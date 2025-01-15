import type { SourceFile } from '../../syntax/SourceFile.js'
import type { HybridObjectSpec } from '../../syntax/HybridObjectSpec.js'
import { getHybridObjectName } from '../../syntax/getHybridObjectName.js'
import { createFileMetadataString } from '../../syntax/helpers.js'
import { NitroConfig } from '../../config/NitroConfig.js'

export function createSwiftHybridViewManager(
  spec: HybridObjectSpec
): SourceFile[] {
  const name = getHybridObjectName(spec.name)
  const propsClassName = `${name.HybridT}Props`
  const stateClassName = `${name.HybridT}State`
  const nameVariable = `${name.HybridT}ComponentName`
  const shadowNodeClassName = `${name.HybridT}ShadowNode`
  const descriptorClassName = `${name.HybridT}ComponentDescriptor`
  const component = `${spec.name}Component`
  const namespace = NitroConfig.getCxxNamespace('c++')

  const propsCode = `
${createFileMetadataString(`${component}.hpp`)}

#pragma once

#import <react/renderer/core/PropsParserContext.h>
#import <react/renderer/components/view/ViewProps.h>
#import <react/renderer/components/view/ConcreteViewShadowNode.h>

namespace ${namespace} {

  using namespace facebook;

  class ${propsClassName}: public react::ViewProps {
  public:
    explicit ${propsClassName}() = default;
    ${propsClassName}(const react::PropsParserContext& context,
                      const ${propsClassName}& sourceProps,
                      const react::RawProps& rawProps): react::ViewProps(context, sourceProps, rawProps) {
      throw std::runtime_error("not yet implemented!");
    }
  };

  class ${stateClassName} {
  public:
    explicit ${stateClassName}() = default;
  };

  extern const char ${nameVariable}[] = "${name.HybridT}";
  using ${shadowNodeClassName} = react::ConcreteViewShadowNode<${nameVariable}, ${propsClassName}, react::ViewEventEmitter, ${stateClassName}>;

  class ${descriptorClassName}: public react::ConcreteComponentDescriptor<${shadowNodeClassName}> {
  public:
    ${descriptorClassName}(const react::ComponentDescriptorParameters& parameters)
      : ConcreteComponentDescriptor(parameters, std::make_unique<RawPropsParser>(/* enable raw JSI props parsing */ true)) {}
  };

  // TODO: Actual RCTViewComponentView goes here... or in Swift?

} // namespace ${namespace}
  `.trim()

  return [
    {
      name: `${component}.hpp`,
      content: propsCode,
      language: 'c++',
      platform: 'ios',
      subdirectory: [],
    },
  ]
}
