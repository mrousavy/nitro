import type { Language } from '../../getPlatformSpecs.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'

export class HybridObjectType implements Type {
  readonly hybridObjectName: string

  constructor(hybridObjectName: string) {
    this.hybridObjectName = hybridObjectName
  }

  get canBePassedByReference(): boolean {
    return false
  }

  get kind(): TypeKind {
    return 'hybrid-object'
  }

  getCode(language: Language): string {
    const name = getHybridObjectName(this.hybridObjectName)

    switch (language) {
      case 'c++':
        return `std::shared_ptr<${name.HybridT}>`
      case 'swift':
        return name.TSpec
      case 'kotlin':
        return name.HybridT
      default:
        throw new Error(
          `Language ${language} is not yet supported for HybridObjectType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
  getRequiredImports(): SourceImport[] {
    const name = getHybridObjectName(this.hybridObjectName)
    return [
      {
        name: `${name.HybridT}.hpp`,
        forwardDeclaration: getForwardDeclaration('class', name.HybridT),
        language: 'c++',
      },
    ]
  }
}
