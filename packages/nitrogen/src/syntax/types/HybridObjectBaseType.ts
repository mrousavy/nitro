import type { Language } from '../../getPlatformSpecs.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class HybridObjectBaseType implements Type {
  constructor() {}

  get canBePassedByReference(): boolean {
    // It's a shared_ptr<..>, no copy.
    return true
  }

  get kind(): TypeKind {
    return 'hybrid-object-base'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return `std::shared_ptr<HybridObject>`
      default:
        throw new Error(
          `The base type \`HybridObject\` cannot be used directly in ${language} yet. Use a specific derived class of \`HybridObject\` instead!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
  getRequiredImports(language: Language): SourceImport[] {
    const imports: SourceImport[] = []
    if (language === 'c++') {
      imports.push(
        {
          language: 'c++',
          name: 'memory',
          space: 'system',
        },
        {
          name: `NitroModules/HybridObject.hpp`,
          forwardDeclaration: getForwardDeclaration(
            'class',
            'HybridObject',
            'margelo::nitro'
          ),
          language: 'c++',
          space: 'system',
        }
      )
    }
    return imports
  }
}
