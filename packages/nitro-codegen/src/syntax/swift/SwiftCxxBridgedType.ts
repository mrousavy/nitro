import { HybridObjectType } from '../types/HybridObjectType.js'
import type { Type } from '../types/Type.js'
import { getHybridObjectProtocolName } from './getHybridObjectProtocolName.js'

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
      case 'hybrid-object':
        if (!(this.type instanceof HybridObjectType))
          throw new Error(`this.type was not a HybridObjectType!`)

        switch (language) {
          case 'c++':
            console.log(`----> IN C++: ${this.type.getCode('c++')}`)
            return this.type.getCode('c++')
          case 'swift':
            const specName = getHybridObjectProtocolName(
              this.type.hybridObjectName
            )
            return `${specName}Cxx`
          default:
            throw new Error(`Invalid language! ${language}`)
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
        if (!(this.type instanceof HybridObjectType))
          throw new Error(`this.type was not a HybridObjectType!`)
        switch (language) {
          case 'c++':
            return `${cppParameterName}.getSwiftPart()`
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
        if (!(this.type instanceof HybridObjectType))
          throw new Error(`this.type was not a HybridObjectType!`)
        switch (language) {
          case 'c++':
            return `${this.type.hybridObjectName}Swift(${swiftParameterName})`
          case 'swift':
            // We just pass it to C++ directly from swift
            return `${this.type.hybridObjectName}SpecCxx(${swiftParameterName})`
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
