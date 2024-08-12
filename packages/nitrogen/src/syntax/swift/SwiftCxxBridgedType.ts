import { NitroConfig } from '../../config/NitroConfig.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import {
  getHybridObjectName,
  type HybridObjectName,
} from '../getHybridObjectName.js'
import { toReferenceType } from '../helpers.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import { ArrayType } from '../types/ArrayType.js'
import { getTypeAs } from '../types/getTypeAs.js'
import { HybridObjectType } from '../types/HybridObjectType.js'
import { OptionalType } from '../types/OptionalType.js'
import { StructType } from '../types/StructType.js'
import type { Type } from '../types/Type.js'
import { createSwiftStruct } from './SwiftStruct.js'

// TODO: Gradually add more Swift types as `JSIConverter<..>` overloads to avoid
//       converting to C++ first. This could speed up swift::String, swift::Array, etc
export class SwiftCxxBridgedType {
  private readonly type: Type

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
      case 'hybrid-object':
        // Swift HybridObjects need to be wrapped in our own *Cxx Swift classes.
        // We wrap/unwrap them if needed.
        return true
      case 'optional':
        // swift::Optional<T> <> std::optional<T>
        return true
      case 'string':
        // swift::String <> std::string
        return true
      case 'array':
        // swift::Array<T> <> std::vector<T>
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
      const namespace = NitroConfig.getCxxNamespace('c++')
      imports.push({
        name: `${name.HybridTSpecSwift}.hpp`,
        forwardDeclaration: getForwardDeclaration(
          'class',
          name.HybridTSpecSwift,
          namespace
        ),
        language: 'c++',
        space: 'user',
      })
    }

    return imports
  }

  getExtraFiles(): SourceFile[] {
    const files: SourceFile[] = []
    switch (this.type.kind) {
      case 'struct': {
        const struct = getTypeAs(this.type, StructType)
        files.push(createSwiftStruct(struct))
        break
      }
      default:
        break
    }
    return files
  }

  getTypeCode(language: 'swift' | 'c++'): string {
    switch (this.type.kind) {
      case 'hybrid-object': {
        const name = getTypeHybridObjectName(this.type)
        switch (language) {
          case 'c++':
            return `std::shared_ptr<${name.HybridTSpecSwift}>`
          case 'swift':
            return name.HybridTSpecCxx
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      }
      case 'optional': {
        const optional = getTypeAs(this.type, OptionalType)
        const wrapping = new SwiftCxxBridgedType(optional.wrappingType)
        const type = wrapping.getTypeCode(language)
        switch (language) {
          case 'c++':
            return `std::optional<${type}>`
          case 'swift':
            return `${type}?`
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      }
      case 'string': {
        switch (language) {
          case 'c++':
            return `swift::String`
          case 'swift':
            return 'String'
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      }
      case 'array': {
        const array = getTypeAs(this.type, ArrayType)
        const wrapping = new SwiftCxxBridgedType(array.itemType)
        const type = wrapping.getTypeCode(language)
        switch (language) {
          case 'c++':
            return `swift::Array<${type}>`
          case 'swift':
            return `[${type}]`
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
      case 'hybrid-object':
        switch (language) {
          case 'c++':
            const name = getTypeHybridObjectName(this.type)
            return `std::static_pointer_cast<${name.HybridTSpecSwift}>(${cppParameterName})->getSwiftPart()`
          case 'swift':
            return `${cppParameterName}.implementation`
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      case 'optional': {
        const optionalType = getTypeAs(this.type, OptionalType)
        const wrappingType = new SwiftCxxBridgedType(optionalType.wrappingType)
        const type = wrappingType.getTypeCode(language)
        switch (language) {
          case 'c++':
            return `${cppParameterName}.has_value() ? swift::Optional<${type}>::some(${cppParameterName}.value()) : swift::Optional<${type}>::none()`
          case 'swift':
            return wrappingType.parseFromCppToSwift(
              `${cppParameterName}.value`,
              'swift'
            )
          default:
            return cppParameterName
        }
      }
      case 'string': {
        switch (language) {
          case 'c++':
            return `swift::String(${cppParameterName})`
          case 'swift':
            return `String(${cppParameterName})`
          default:
            return cppParameterName
        }
      }
      case 'array': {
        const array = getTypeAs(this.type, ArrayType)
        const wrapping = new SwiftCxxBridgedType(array.itemType)
        switch (language) {
          case 'c++':
            const typeAssign = array.itemType.canBePassedByReference
              ? toReferenceType(array.itemType.getCode('c++'))
              : array.itemType.getCode('c++')
            return `
[&]() -> swift::Array<${wrapping.getTypeCode('c++')}> {
  auto array = swift::Array<${wrapping.getTypeCode('c++')}>::init();
  array.reserveCapacity(${cppParameterName}.size());
  for (${typeAssign} i : ${cppParameterName}) {
    array.append(${wrapping.parseFromCppToSwift('i', 'c++')});
  }
  return array;
}()
            `.trim()
          default:
            return cppParameterName
        }
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
      case 'hybrid-object':
        const name = getTypeHybridObjectName(this.type)
        switch (language) {
          case 'c++':
            return `HybridContext::getOrCreate<${name.HybridTSpecSwift}>(${swiftParameterName})`
          case 'swift':
            return `${swiftParameterName}.createCxxBridge()`
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      case 'optional': {
        const optional = getTypeAs(this.type, OptionalType)
        const wrapping = new SwiftCxxBridgedType(optional.wrappingType)
        switch (language) {
          case 'c++':
            const optionalT = optional.wrappingType.getCode('c++')
            return `${swiftParameterName} ? std::optional<${optionalT}>(${wrapping.parseFromSwiftToCpp(`${swiftParameterName}.get()`, 'c++')}) : std::nullopt`
          case 'swift':
            return wrapping.parseFromSwiftToCpp(swiftParameterName, 'swift')
          default:
            return swiftParameterName
        }
      }
      case 'string': {
        switch (language) {
          case 'c++':
            // swift::String has operator std::string(), so it can be implicitly converted
            return swiftParameterName
          case 'swift':
            return `std.string(${swiftParameterName})`
          default:
            return swiftParameterName
        }
      }
      case 'array': {
        const array = getTypeAs(this.type, ArrayType)
        const wrapping = new SwiftCxxBridgedType(array.itemType)
        switch (language) {
          case 'c++':
            const typeAssign = wrapping.canBePassedByReference
              ? toReferenceType(wrapping.getTypeCode('c++'))
              : wrapping.getTypeCode('c++')
            return `
[&]() -> ${array.getCode('c++')} {
  ${array.getCode('c++')} vector;
  vector.reserve(${swiftParameterName}.getCount());
  for (${typeAssign} i : ${swiftParameterName}) {
    vector.push_back(${wrapping.parseFromSwiftToCpp('i', 'c++')});
  }
  return vector;
}()
            `.trim()
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

function getTypeHybridObjectName(type: Type): HybridObjectName {
  const hybridObject = getTypeAs(type, HybridObjectType)
  return getHybridObjectName(hybridObject.hybridObjectName)
}
