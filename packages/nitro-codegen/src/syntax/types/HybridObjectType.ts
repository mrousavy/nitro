import type { Language } from '../../getPlatformSpecs.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import { getHybridObjectName } from '../c++/getHybridObjectName.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import { getHybridObjectProtocolName } from '../swift/getHybridObjectProtocolName.js'
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
    switch (language) {
      case 'c++':
        const cxxName = getHybridObjectName(this.hybridObjectName)
        return `std::shared_ptr<${cxxName}>`
      case 'swift':
        return getHybridObjectProtocolName(this.hybridObjectName)
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
    const cxxName = getHybridObjectName(this.hybridObjectName)
    return [
      {
        name: `${cxxName}.hpp`,
        forwardDeclaration: getForwardDeclaration('class', cxxName),
        language: 'c++',
      },
    ]
  }
}
