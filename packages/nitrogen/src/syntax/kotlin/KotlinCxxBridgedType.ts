import type { BridgedType } from '../BridgedType.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { getReferencedTypes } from '../getReferencedTypes.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import { ArrayType } from '../types/ArrayType.js'
import { EnumType } from '../types/EnumType.js'
import { FunctionType } from '../types/FunctionType.js'
import { getTypeAs } from '../types/getTypeAs.js'
import { HybridObjectType } from '../types/HybridObjectType.js'
import { StructType } from '../types/StructType.js'
import type { Type } from '../types/Type.js'

export class KotlinCxxBridgedType implements BridgedType<'kotlin', 'c++'> {
  readonly type: Type

  constructor(type: Type) {
    this.type = type
  }

  get hasType(): boolean {
    return this.type.kind !== 'void' && this.type.kind !== 'null'
  }

  get canBePassedByReference(): boolean {
    return this.type.canBePassedByReference
  }

  get needsSpecialHandling(): boolean {
    switch (this.type.kind) {
      default:
        return false
    }
  }

  getRequiredImports(): SourceImport[] {
    const imports = this.type.getRequiredImports()

    switch (this.type.kind) {
      case 'enum':
        const enumType = getTypeAs(this.type, EnumType)
        imports.push({
          language: 'c++',
          name: `J${enumType.enumName}.hpp`,
          space: 'user',
        })
        break
      case 'struct':
        const structType = getTypeAs(this.type, StructType)
        imports.push({
          language: 'c++',
          name: `J${structType.structName}.hpp`,
          space: 'user',
        })
        break
      case 'hybrid-object': {
        const hybridObjectType = getTypeAs(this.type, HybridObjectType)
        const name = getHybridObjectName(hybridObjectType.hybridObjectName)
        imports.push({
          language: 'c++',
          name: `${name.JHybridTSpec}.hpp`,
          space: 'user',
        })
        imports.push({
          language: 'c++',
          name: 'NitroModules/JNISharedPtr.hpp',
          space: 'system',
        })
        break
      }
      case 'function': {
        const functionType = getTypeAs(this.type, FunctionType)
        const name = functionType.specializationName
        imports.push({
          language: 'c++',
          name: `J${name}.hpp`,
          space: 'user',
        })
        break
      }
    }

    // Recursively look into referenced types (e.g. the `T` of a `optional<T>`, or `T` of a `T[]`)
    const referencedTypes = getReferencedTypes(this.type)
    referencedTypes.forEach((t) => {
      if (t === this.type) {
        // break a recursion - we already know this type
        return
      }
      const bridged = new KotlinCxxBridgedType(t)
      imports.push(...bridged.getRequiredImports())
    })

    return imports
  }

  getExtraFiles(): SourceFile[] {
    const files: SourceFile[] = []

    // Recursively look into referenced types (e.g. the `T` of a `optional<T>`, or `T` of a `T[]`)
    const referencedTypes = getReferencedTypes(this.type)
    referencedTypes.forEach((t) => {
      if (t === this.type) {
        // break a recursion - we already know this type
        return
      }
      const bridged = new KotlinCxxBridgedType(t)
      files.push(...bridged.getExtraFiles())
    })

    return files
  }

  getTypeCode(language: 'kotlin' | 'c++'): string {
    if (language !== 'c++') {
      // In Kotlin, we just use the normal Kotlin types directly.
      return this.type.getCode(language)
    }
    switch (this.type.kind) {
      case 'array':
        const arrayType = getTypeAs(this.type, ArrayType)
        const bridged = new KotlinCxxBridgedType(arrayType.itemType)
        return `JCollection<${bridged.getTypeCode(language)}>`
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

  parse(
    parameterName: string,
    from: 'c++' | 'kotlin',
    to: 'kotlin' | 'c++',
    inLanguage: 'kotlin' | 'c++'
  ): string {
    if (from === 'c++') {
      return this.parseFromCppToKotlin(parameterName, inLanguage)
    } else if (from === 'kotlin') {
      return this.parseFromKotlinToCpp(parameterName, inLanguage)
    } else {
      throw new Error(`Cannot parse "${parameterName}" from ${from} to ${to}!`)
    }
  }

  parseFromCppToKotlin(
    parameterName: string,
    _language: 'kotlin' | 'c++'
  ): string {
    switch (this.type.kind) {
      default:
        // no need to parse anything, just return as is
        return parameterName
    }
  }

  parseFromKotlinToCpp(
    parameterName: string,
    language: 'kotlin' | 'c++'
  ): string {
    switch (this.type.kind) {
      case 'hybrid-object': {
        switch (language) {
          case 'c++':
            const hybrid = getTypeAs(this.type, HybridObjectType)
            const name = getHybridObjectName(hybrid.hybridObjectName)
            return `JNISharedPtr::make_shared_from_jni<${name.JHybridTSpec}>(jni::make_global(${parameterName}))`
          default:
            return parameterName
        }
      }
      default:
        // no need to parse anything, just return as is
        return parameterName
    }
  }
}