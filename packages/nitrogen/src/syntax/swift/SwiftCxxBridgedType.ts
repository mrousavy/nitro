import { NitroConfig } from '../../config/NitroConfig.js'
import type { BridgedType } from '../BridgedType.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import { EnumType } from '../types/EnumType.js'
import { FunctionType } from '../types/FunctionType.js'
import { getTypeAs } from '../types/getTypeAs.js'
import { PromiseType } from '../types/PromiseType.js'
import { StructType } from '../types/StructType.js'
import type { Type } from '../types/Type.js'
import { VariantType } from '../types/VariantType.js'
import { getReferencedTypes } from '../getReferencedTypes.js'
import {
  createSwiftCxxHelpers,
  type SwiftCxxHelper,
} from './SwiftCxxTypeHelper.js'
import { createSwiftEnumBridge } from './SwiftEnum.js'
import { createSwiftStructBridge } from './SwiftStruct.js'
import { createSwiftVariant } from './SwiftVariant.js'
import {
  createSwiftFunctionBridge,
  getSwiftFunctionClassName,
} from './SwiftFunction.js'
import type { Language } from '../../getPlatformSpecs.js'
import { HybridObjectType } from '../types/HybridObjectType.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { ArrayType } from '../types/ArrayType.js'

// TODO: Remove enum bridge once Swift fixes bidirectional enums crashing the `-Swift.h` header.

export class SwiftCxxBridgedType implements BridgedType<'swift', 'c++'> {
  readonly type: Type

  constructor(type: Type) {
    this.type = type
  }

  get hasType(): boolean {
    return this.type.kind !== 'void'
  }

  get canBePassedByReference(): boolean {
    return this.type.canBePassedByReference
  }

  get needsSpecialHandling(): boolean {
    switch (this.type.kind) {
      case 'hybrid-object':
        // Swift HybridObjects need to be wrapped in our own *Cxx Swift classes.
        // We wrap/unwrap them if needed.
        return true
      case 'function':
        // Swift functions are wrapped in hard defined classes
        return true
      case 'enum':
        // Enums are separate Swift enums
        return true
      case 'struct':
        // Structs are separate Swift structs
        return true
      case 'map':
        // AnyMap has to be wrapped in `SwiftAnyMap`
        return true
      default:
        return false
    }
  }

  getRequiredBridge(): SwiftCxxHelper | undefined {
    // Since Swift doesn't support C++ templates, we need to create helper
    // functions that create those types (specialized) for us.
    return createSwiftCxxHelpers(this.type)
  }

  getRequiredImports(language: Language): SourceImport[] {
    const imports = this.type.getRequiredImports(language)

    if (language === 'c++') {
      switch (this.type.kind) {
        case 'array-buffer':
          imports.push({
            name: 'NitroModules/ArrayBufferHolder.hpp',
            forwardDeclaration: getForwardDeclaration(
              'class',
              'ArrayBufferHolder',
              'NitroModules'
            ),
            language: 'c++',
            space: 'system',
          })
          break
        case 'map':
          imports.push({
            name: 'NitroModules/SwiftAnyMap.hpp',
            forwardDeclaration: getForwardDeclaration(
              'class',
              'SwiftAnyMap',
              'margelo::nitro'
            ),
            language: 'c++',
            space: 'system',
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
      const bridged = new SwiftCxxBridgedType(t)
      imports.push(...bridged.getRequiredImports(language))
    })

    return imports
  }

  getExtraFiles(): SourceFile[] {
    const files: SourceFile[] = []

    switch (this.type.kind) {
      case 'struct': {
        const struct = getTypeAs(this.type, StructType)
        const structFiles = createSwiftStructBridge(struct)
        files.push(...structFiles)
        const extraFiles = structFiles.flatMap((f) =>
          f.referencedTypes.flatMap((t) => {
            const bridge = new SwiftCxxBridgedType(t)
            return bridge.getExtraFiles()
          })
        )
        files.push(...extraFiles)
        break
      }
      case 'enum': {
        const enumType = getTypeAs(this.type, EnumType)
        files.push(...createSwiftEnumBridge(enumType))
        break
      }
      case 'function': {
        const functionType = getTypeAs(this.type, FunctionType)
        files.push(...createSwiftFunctionBridge(functionType))
        break
      }
      case 'promise': {
        // Promise needs resolver and rejecter funcs in Swift
        const promiseType = getTypeAs(this.type, PromiseType)
        files.push(...createSwiftFunctionBridge(promiseType.resolverFunction))
        files.push(...createSwiftFunctionBridge(promiseType.rejecterFunction))
        break
      }
      case 'variant': {
        const variant = getTypeAs(this.type, VariantType)
        const file = createSwiftVariant(variant)
        files.push(file)
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
      const bridged = new SwiftCxxBridgedType(t)
      files.push(...bridged.getExtraFiles())
    })

    return files
  }

  private get iosNamespace(): string {
    return NitroConfig.current.getIosModuleName()
  }

  getTypeCode(language: 'swift' | 'c++'): string {
    switch (this.type.kind) {
      case 'function': {
        const functionType = getTypeAs(this.type, FunctionType)
        const functionClassName = getSwiftFunctionClassName(functionType)
        switch (language) {
          case 'c++':
            return `${this.iosNamespace}::${functionClassName}`
          case 'swift':
            return functionClassName
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      }
      case 'enum': {
        const enumType = getTypeAs(this.type, EnumType)
        switch (language) {
          case 'c++':
            return `${this.iosNamespace}::${enumType.enumName}`
          case 'swift':
            return enumType.enumName
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      }
      case 'hybrid-object': {
        const hybridObjectType = getTypeAs(this.type, HybridObjectType)
        const { HybridTSpecCxx } = getHybridObjectName(
          hybridObjectType.hybridObjectName
        )
        switch (language) {
          case 'c++':
            return `${hybridObjectType.sourceConfig.getIosModuleName()}::${HybridTSpecCxx}`
          case 'swift':
            return HybridTSpecCxx
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      }
      case 'map': {
        switch (language) {
          case 'c++':
            return `margelo::nitro::SwiftAnyMap`
          case 'swift':
            return `margelo.nitro.SwiftAnyMap`
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      }
      case 'array': {
        const arrayType = getTypeAs(this.type, ArrayType)
        const itemType = new SwiftCxxBridgedType(arrayType.itemType)
        if (!itemType.needsSpecialHandling) {
          return this.type.getCode(language)
        }
        switch (language) {
          case 'c++':
            return `std::vector<${itemType.getTypeCode('c++')}>`
          case 'swift':
            return `[${itemType.getTypeCode('swift')}]`
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      }
      default:
        // No workaround - just return normal type
        return this.type.getCode(language)
    }
  }

  parse(
    parameterName: string,
    from: 'c++' | 'swift',
    to: 'swift' | 'c++',
    inLanguage: 'swift' | 'c++'
  ): string {
    if (from === 'c++') {
      return this.parseFromCppToSwift(parameterName, inLanguage)
    } else if (from === 'swift') {
      return this.parseFromSwiftToCpp(parameterName, inLanguage)
    } else {
      throw new Error(`Cannot parse from ${from} to ${to}!`)
    }
  }

  parseFromCppToSwift(
    cppParameterName: string,
    language: 'swift' | 'c++'
  ): string {
    switch (this.type.kind) {
      case 'function': {
        switch (language) {
          case 'c++':
            return cppParameterName
          case 'swift':
            return `${cppParameterName}.closure`
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      }
      case 'hybrid-object': {
        const hybridObjectType = getTypeAs(this.type, HybridObjectType)
        const { HybridTSpec } = getHybridObjectName(
          hybridObjectType.hybridObjectName
        )
        switch (language) {
          case 'swift':
            return `${cppParameterName}.get${HybridTSpec}()`
          default:
            return cppParameterName
        }
      }
      case 'map': {
        switch (language) {
          case 'swift':
            return `${cppParameterName}.getSwiftPart()`
          default:
            return cppParameterName
        }
      }
      case 'array': {
        const arrayType = getTypeAs(this.type, ArrayType)
        const itemType = new SwiftCxxBridgedType(arrayType.itemType)
        if (!itemType.needsSpecialHandling) {
          return cppParameterName
        }
        switch (language) {
          case 'swift':
            return `${cppParameterName}.map({ item in ${itemType.parseFromCppToSwift('item', 'swift')} })`
          default:
            return cppParameterName
        }
      }
      case 'void':
        return ''
      default:
        // No workaround - we can just use the value we get from C++
        return cppParameterName
    }
  }

  parseFromSwiftToCpp(
    swiftParameterName: string,
    language: 'swift' | 'c++'
  ): string {
    switch (this.type.kind) {
      case 'function': {
        const functionType = getTypeAs(this.type, FunctionType)
        const functionClassName = getSwiftFunctionClassName(functionType)
        switch (language) {
          case 'swift':
            return `${functionClassName}(${swiftParameterName})`
          default:
            return swiftParameterName
        }
      }
      case 'hybrid-object': {
        switch (language) {
          case 'swift':
            return `${swiftParameterName}.getCxxWrapper()`
          default:
            return swiftParameterName
        }
      }
      case 'map': {
        switch (language) {
          case 'swift':
            return `margelo.nitro.SwiftAnyMap(${swiftParameterName})`
          default:
            return swiftParameterName
        }
      }
      case 'array': {
        const arrayType = getTypeAs(this.type, ArrayType)
        const itemType = new SwiftCxxBridgedType(arrayType.itemType)
        if (!itemType.needsSpecialHandling) {
          return swiftParameterName
        }
        switch (language) {
          case 'swift':
            return `${swiftParameterName}.map({ item in ${itemType.parseFromSwiftToCpp('item', 'swift')} })`
          default:
            return swiftParameterName
        }
      }
      case 'void':
        // When type is void, don't return anything
        return ''
      default:
        // No workaround - we can just use the value we get from C++
        return swiftParameterName
    }
  }
}
