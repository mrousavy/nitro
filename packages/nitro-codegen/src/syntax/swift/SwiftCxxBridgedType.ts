import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import {
  getHybridObjectName,
  type HybridObjectName,
} from '../getHybridObjectName.js'
import type { SourceImport } from '../SourceFile.js'
import { FunctionType } from '../types/FunctionType.js'
import { HybridObjectType } from '../types/HybridObjectType.js'
import { NamedWrappingType } from '../types/NamedWrappingType.js'
import type { Type } from '../types/Type.js'

export class SwiftCxxBridgedType {
  private readonly type: Type

  constructor(type: Type) {
    this.type = type
  }

  get needsSpecialHandling(): boolean {
    switch (this.type.kind) {
      case 'enum':
        // Enums cannot be referenced from C++ <-> Swift bi-directionally,
        // so we just pass the underlying raw value (int32), and cast from Int <-> Enum.
        return true
      case 'hybrid-object':
        // Swift HybridObjects need to be wrapped in our own *Cxx Swift classes.
        // We wrap/unwrap them if needed.
        return true
      default:
        return false
    }
  }

  getRequiredImports(): SourceImport[] {
    const imports = this.type.getRequiredImports()

    if (this.type.kind === 'hybrid-object') {
      // Use SwiftCxx wrapper of the HybridObject type
      const name = getTypeHybridObjectName(this.type)
      imports.push({
        name: `${name.HybridTSwift}.hpp`,
        forwardDeclaration: getForwardDeclaration('class', name.HybridTSwift),
        language: 'c++',
      })
    }

    return imports
  }

  getTypeCode(language: 'swift' | 'c++'): string {
    switch (this.type.kind) {
      case 'enum':
        switch (language) {
          case 'c++':
            return 'int'
          case 'swift':
            return 'Int32'
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      case 'hybrid-object': {
        const name = getTypeHybridObjectName(this.type)
        switch (language) {
          case 'c++':
            return `std::shared_ptr<${name.HybridTSwift}>`
          case 'swift':
            return name.TSpecCxx
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      }
      case 'function': {
        const func = getTypeAs(this.type, FunctionType)
        switch (language) {
          case 'c++':
            return func.specialization.typename
          case 'swift':
            return func.specialization.typename
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      }
      default:
        // No workaround - just return normal type
        return this.type.getCode(language)
    }
  }

  parseFromCppToSwift(
    cppParameterName: string,
    language: 'swift' | 'c++'
  ): string {
    switch (this.type.kind) {
      case 'enum':
        switch (language) {
          case 'c++':
            return `static_cast<int>(${cppParameterName})`
          case 'swift':
            return `${this.type.getCode('swift')}(rawValue: ${cppParameterName})!`
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      case 'hybrid-object':
        switch (language) {
          case 'c++':
            const name = getTypeHybridObjectName(this.type)
            return `std::static_pointer_cast<${name.HybridTSwift}>(${cppParameterName})->getSwiftPart()`
          case 'swift':
            return `${cppParameterName}.implementation`
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      case 'void':
        // When type is void, don't return anything
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
      case 'enum':
        switch (language) {
          case 'c++':
            return `static_cast<${this.type.getCode('swift')}>(${swiftParameterName})`
          case 'swift':
            return `${swiftParameterName}.rawValue`
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      case 'hybrid-object':
        const name = getTypeHybridObjectName(this.type)
        switch (language) {
          case 'c++':
            return `HybridContext::getOrCreate<${name.HybridTSwift}>(${swiftParameterName})`
          case 'swift':
            // We just pass it to C++ directly from swift
            return `${name.TSpecCxx}(${swiftParameterName})`
          default:
            throw new Error(`Invalid language! ${language}`)
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

function getTypeHybridObjectName(type: Type): HybridObjectName {
  const hybridObject = getTypeAs(type, HybridObjectType)
  return getHybridObjectName(hybridObject.hybridObjectName)
}

function getTypeAs<T>(
  type: Type,
  classReference: new (...args: any[]) => T
): T {
  if (type instanceof classReference) {
    return type as unknown as T
  } else if (type instanceof NamedWrappingType) {
    return getTypeAs(type.type, classReference)
  } else {
    throw new Error(`Type of kind "${type.kind}" is not a ${classReference}!`)
  }
}
