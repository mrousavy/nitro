import { NitroConfig } from '../../config/NitroConfig.js'
import type { Language } from '../../getPlatformSpecs.js'
import { createCppStruct } from '../c++/CppStruct.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import {
  type FileWithReferencedTypes,
  type SourceFile,
  type SourceImport,
} from '../SourceFile.js'
import type { GetCodeOptions, NamedType, Type, TypeKind } from './Type.js'

export class StructType implements Type {
  readonly structName: string
  private _properties: NamedType[] | null = null
  private _propertiesGetter: (() => NamedType[]) | null = null
  private _declarationFile: FileWithReferencedTypes | null = null
  private _isInitializing = false

  constructor(
    structName: string,
    properties: NamedType[] | (() => NamedType[])
  ) {
    this.structName = structName
    if (typeof properties === 'function') {
      // Lazy initialization for cyclic types
      this._propertiesGetter = properties
    } else {
      this._properties = properties
      this._declarationFile = createCppStruct(structName, properties)
    }

    if (this.structName.startsWith('__')) {
      throw new Error(
        `Struct name cannot start with two underscores (__) as this is reserved syntax for Nitrogen! (In ${this.structName})`
      )
    }
  }

  get initialized(): boolean {
    return this._declarationFile !== null
  }

  private ensureInitialized(): void {
    if (this._isInitializing) {
      throw new Error(
        `StructType "${this.structName}" accessed during cyclic initialization`
      )
    }
    if (this._properties === null && this._propertiesGetter !== null) {
      this._isInitializing = true
      try {
        this._properties = this._propertiesGetter()
        this._propertiesGetter = null
        if (this._properties.length === 0) {
          throw new Error(
            `Empty structs are not supported in Nitrogen! Add at least one property to ${this.structName}.`
          )
        }
        this._declarationFile = createCppStruct(
          this.structName,
          this._properties
        )
      } finally {
        this._isInitializing = false
      }
    }
  }

  get properties(): NamedType[] {
    this.ensureInitialized()
    return this._properties!
  }

  get declarationFile(): FileWithReferencedTypes {
    this.ensureInitialized()
    return this._declarationFile!
  }

  get canBePassedByReference(): boolean {
    // It's a struct, heavy to copy.
    return true
  }
  get kind(): TypeKind {
    return 'struct'
  }
  get isEquatable(): boolean {
    return this.properties.every((p) => p.isEquatable)
  }

  getCode(language: Language, { fullyQualified }: GetCodeOptions = {}): string {
    switch (language) {
      case 'c++':
        if (fullyQualified) {
          return NitroConfig.current.getCxxNamespace('c++', this.structName)
        } else {
          return this.structName
        }
      case 'swift':
        return this.structName
      case 'kotlin':
        return this.structName
      default:
        throw new Error(
          `Language ${language} is not yet supported for StructType!`
        )
    }
  }
  getExtraFiles(visited: Set<Type> = new Set()): SourceFile[] {
    if (visited.has(this)) {
      return []
    }
    visited.add(this)
    // If still initializing (cyclic reference), return empty for now
    // The parent struct will include all necessary files once fully initialized
    if (!this.initialized) {
      return []
    }
    const declFile = this.declarationFile
    const referencedTypes = declFile.referencedTypes.flatMap((r) =>
      r.getExtraFiles(visited)
    )
    return [declFile, ...referencedTypes]
  }
  getRequiredImports(
    language: Language,
    visited: Set<Type> = new Set()
  ): SourceImport[] {
    if (visited.has(this)) {
      return []
    }
    visited.add(this)
    const imports: SourceImport[] = []
    if (language === 'c++') {
      const cxxNamespace = NitroConfig.current.getCxxNamespace('c++')
      // If still initializing (cyclic reference), use structName directly
      // The forward declaration is still valid even during initialization
      const name = this.initialized
        ? this.declarationFile.name
        : `${this.structName}.hpp`
      const lang = this.initialized ? this.declarationFile.language : 'c++'
      imports.push({
        name: name,
        language: lang,
        forwardDeclaration: getForwardDeclaration(
          'struct',
          this.structName,
          cxxNamespace
        ),
        space: 'user',
      })
    }
    return imports
  }
}
