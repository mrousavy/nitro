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
  const namespace = NitroConfig.getCxxNamespace('c++')

  const propsCode = `
${createFileMetadataString(`${name.HybridT}ViewProps.hpp`)}

#pragma once

#import <react/renderer/core/PropsParserContext.h>
#import <react/renderer/components/view/ViewProps.h>

namespace ${namespace} {

  using namespace facebook;

  class ${propsClassName}: public react::ViewProps {
  public:
    explicit ${propsClassName}() = default;
    ${propsClassName}(const react::PropsParserContext& context,
                      const ${propsClassName}& sourceProps,
                      const react::RawProps& rawProps) {
      throw std::runtime_error("not yet implemented!");
    }
  };

} // namespace ${namespace}
  `.trim()

  return [
    {
      name: `${propsClassName}.hpp`,
      content: propsCode,
      language: 'c++',
      platform: 'ios',
      subdirectory: [],
    },
  ]
}
