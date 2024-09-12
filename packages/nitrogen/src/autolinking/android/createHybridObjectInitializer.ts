import { NitroConfig } from '../../config/NitroConfig.js'
import type { SourceFile } from '../../syntax/SourceFile.js'

export function createHybridObjectIntializer(): SourceFile[] {
  const autolinkingClassName = `${NitroConfig.getIosModuleName()}Autolinking`

  return [
    {
      content: '',
      language: 'c++',
      name: `${autolinkingClassName}.hpp`,
      platform: 'android',
      subdirectory: [],
    },
    {
      content: '',
      language: 'c++',
      name: `${autolinkingClassName}.cpp`,
      platform: 'android',
      subdirectory: [],
    },
    {
      content: '',
      language: 'kotlin',
      name: `${autolinkingClassName}.kt`,
      platform: 'android',
      subdirectory: [],
    },
  ]
}
