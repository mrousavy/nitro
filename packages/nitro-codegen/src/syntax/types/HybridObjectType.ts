import type { Language } from '../../getPlatformSpecs.js'
import { getHybridObjectName } from '../c++/getHybridObjectName.js'
import type { SourceFile } from '../SourceFile.js'
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
    // TODO: We need to include the HybridObject...
    return []
  }
}
