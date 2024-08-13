import type { Language } from '../../getPlatformSpecs.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import { ArrayType } from './ArrayType.js'
import { EnumType } from './EnumType.js'
import { FunctionType } from './FunctionType.js'
import { getTypeAs } from './getTypeAs.js'
import { HybridObjectType } from './HybridObjectType.js'
import { StructType } from './StructType.js'
import type { Type, TypeKind } from './Type.js'

export class JNIWrappedType<T extends Type> implements Type {
  readonly type: T

  constructor(type: T) {
    this.type = type
  }

  get canBePassedByReference(): boolean {
    return this.type.canBePassedByReference
  }
  get kind(): TypeKind {
    return this.type.kind
  }
  get requiredJNIImport(): SourceImport | undefined {
    switch (this.kind) {
      case 'enum':
        const enumType = getTypeAs(this.type, EnumType)
        return {
          language: 'c++',
          name: `J${enumType.enumName}.hpp`,
          space: 'user',
        }
      case 'struct':
        const structType = getTypeAs(this.type, StructType)
        return {
          language: 'c++',
          name: `J${structType.structName}.hpp`,
          space: 'user',
        }
      case 'hybrid-object': {
        const hybridObjectType = getTypeAs(this.type, HybridObjectType)
        const name = getHybridObjectName(hybridObjectType.hybridObjectName)
        return {
          language: 'c++',
          name: `${name.JHybridTSpec}.hpp`,
          space: 'user',
        }
      }
      case 'function': {
        const functionType = getTypeAs(this.type, FunctionType)
        const name = functionType.specializationName
        return {
          language: 'c++',
          name: `J${name}.hpp`,
          space: 'user',
        }
      }
      default:
        return undefined
    }
  }

  getCode(language: Language): string {
    if (language !== 'c++') {
      // JNI types only wrap C++ types
      return this.type.getCode(language)
    }
    switch (this.kind) {
      case 'array':
        const arrayType = getTypeAs(this.type, ArrayType)
        const wrapped = new JNIWrappedType(arrayType.itemType)
        return `JCollection<${wrapped.getCode(language)}>`
      case 'enum':
        const enumType = getTypeAs(this.type, EnumType)
        return `J${enumType.enumName}`
      case 'struct':
        const structType = getTypeAs(this.type, StructType)
        return `J${structType.structName}`
      case 'hybrid-object': {
        const hybridObjectType = getTypeAs(this.type, HybridObjectType)
        const name = getHybridObjectName(hybridObjectType.hybridObjectName)
        return `jni::alias_ref<${name.JHybridTSpec}::javaobject>`
      }
      case 'function': {
        const functionType = getTypeAs(this.type, FunctionType)
        const name = functionType.specializationName
        return `jni::alias_ref<J${name}::javaobject>`
      }
      default:
        return this.type.getCode(language)
    }
  }

  getExtraFiles(): SourceFile[] {
    return this.type.getExtraFiles()
  }
  getRequiredImports(): SourceImport[] {
    const imports = [...this.type.getRequiredImports()]
    if (this.requiredJNIImport != null) {
      imports.push(this.requiredJNIImport)
    }
    return imports
  }
}
