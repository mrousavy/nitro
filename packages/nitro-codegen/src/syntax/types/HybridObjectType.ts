import type { Language } from '../../getPlatformSpecs.js'
import type { SourceFile } from '../SourceFile.js'
import type { Type } from './Type.js'

export class HybridObjectType implements Type {
  readonly hybridObjectName: string

  constructor(hybridObjectName: string) {
    this.hybridObjectName = hybridObjectName
  }

  get canBePassedByReference(): boolean {
    return false
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return `std::shared_ptr<${this.hybridObjectName}>`
      default:
        throw new Error(
          `Language ${language} is not yet supported for HybridObjectType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return []
  }
}
