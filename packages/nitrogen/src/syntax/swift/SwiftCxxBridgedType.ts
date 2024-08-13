import { NitroConfig } from '../../config/NitroConfig.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import {
  getHybridObjectName,
  type HybridObjectName,
} from '../getHybridObjectName.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import { ArrayType } from '../types/ArrayType.js'
import { EnumType } from '../types/EnumType.js'
import { FunctionType } from '../types/FunctionType.js'
import { getTypeAs } from '../types/getTypeAs.js'
import { HybridObjectType } from '../types/HybridObjectType.js'
import { OptionalType } from '../types/OptionalType.js'
import type { Type } from '../types/Type.js'
import { createSwiftCallback } from './SwiftCallback.js'
import {
  createSwiftCxxHelpers,
  type SwiftCxxHelper,
} from './SwiftCxxTypeHelper.js'

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
      case 'enum':
        // Enums cannot be referenced from C++ <-> Swift bi-directionally,
        // so we just pass the underlying raw value (int32), and cast from Int <-> Enum.
        return true
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
      case 'function':
        // (@ecaping () -> Void) <> std::function<...>
        return true
      default:
        return false
    }
  }

  getRequiredBridges(): SwiftCxxHelper[] {
    // Since Swift doesn't support C++ templates, we need to create helper
    // functions that create those types (specialized) for us.
    return createSwiftCxxHelpers(this.type)
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
    } else if (this.type.kind === 'function') {
      const funcType = getTypeAs(this.type, FunctionType)
      const name = `Callback_${funcType.specializationName}`
      const namespace = NitroConfig.getCxxNamespace('c++')
      imports.push({
        name: `${name}.hpp`,
        language: 'c++',
        space: 'user',
        forwardDeclaration: getForwardDeclaration('struct', name, namespace),
      })
    }

    return imports
  }

  getExtraFiles(): SourceFile[] {
    const files: SourceFile[] = []

    if (this.type.kind === 'function') {
      const funcType = getTypeAs(this.type, FunctionType)
      const callbackFile = createSwiftCallback(funcType)
      files.push(callbackFile.declarationFile)
    }

    return files
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
            return `std::shared_ptr<${name.HybridTSpecSwift}>`
          case 'swift':
            return name.HybridTSpecCxx
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      }
      case 'optional': {
        const optionalType = getTypeAs(this.type, OptionalType)
        const wrapping = new SwiftCxxBridgedType(optionalType.wrappingType)
        const type = wrapping.getTypeCode(language)
        switch (language) {
          case 'c++':
            return `swift::Optional<${type}>`
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
      case 'function': {
        const functionType = getTypeAs(this.type, FunctionType)
        const callbackName = `Callback_${functionType.specializationName}`
        return NitroConfig.getCxxNamespace(language, callbackName)
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
        const enumType = getTypeAs(this.type, EnumType)
        switch (language) {
          case 'c++':
            return `static_cast<int>(${cppParameterName})`
          case 'swift':
            const fullName = NitroConfig.getCxxNamespace(
              'swift',
              enumType.enumName
            )
            return `${fullName}(rawValue: ${cppParameterName})!`
          default:
            throw new Error(`Invalid language! ${language}`)
        }
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
        const wrapping = new SwiftCxxBridgedType(optionalType.wrappingType)
        const type = wrapping.getTypeCode(language)
        switch (language) {
          case 'c++':
            return `${cppParameterName}.has_value() ? swift::Optional<${type}>::some(${cppParameterName}.value()) : swift::Optional<${type}>::none()`
          default:
            return cppParameterName
        }
      }
      case 'string': {
        switch (language) {
          case 'c++':
            return `swift::String(${cppParameterName})`
          default:
            return cppParameterName
        }
      }
      case 'array': {
        const array = getTypeAs(this.type, ArrayType)
        const wrapping = new SwiftCxxBridgedType(array.itemType)
        const cxxType = array.itemType.getCode('c++')
        const swiftType = wrapping.getTypeCode('c++')
        const typeDecl = wrapping.canBePassedByReference
          ? `const auto&`
          : `auto`
        switch (language) {
          case 'c++':
            return `
[&]() -> swift::Array<${swiftType}> {
  std::Array<${cxxType}> array;
  array.reserveCapacity(${cppParameterName}.size());
  for (${typeDecl} i : ${cppParameterName}) {
    array.append(${wrapping.parseFromCppToSwift('i', language)});
  }
  return array;
}()`.trim()
          default:
            return cppParameterName
        }
      }
      case 'function': {
        const funcType = getTypeAs(this.type, FunctionType)
        switch (language) {
          case 'swift':
            const paramsSignature = funcType.parameters.map(
              (p) => `${p.escapedName}: ${p.getCode('swift')}`
            )
            const returnType = funcType.returnType.getCode('swift')
            const signature = `(${paramsSignature.join(', ')}) -> ${returnType}`
            const paramsForward = funcType.parameters.map((p) => {
              const bridged = new SwiftCxxBridgedType(p)
              return bridged.parseFromCppToSwift(p.escapedName, 'swift')
            })

            if (funcType.returnType.kind === 'void') {
              return `{ ${signature} in ${cppParameterName}.call(${paramsForward.join(', ')}) }`
            } else {
              const resultBridged = new SwiftCxxBridgedType(funcType.returnType)
              return `{ ${signature} in let result = ${cppParameterName}.call(${paramsForward.join(', ')}); return ${resultBridged.parseFromSwiftToCpp('result', 'swift')} }`
            }
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
      case 'enum':
        switch (language) {
          case 'c++':
            return `static_cast<${this.type.getCode('c++')}>(${swiftParameterName})`
          case 'swift':
            return `${swiftParameterName}.rawValue`
          default:
            throw new Error(`Invalid language! ${language}`)
        }
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
        switch (language) {
          case 'c++':
            return `${swiftParameterName} ? ${swiftParameterName}.get() : nullptr`
          default:
            return swiftParameterName
        }
      }
      case 'string': {
        switch (language) {
          case 'c++':
            return `std::string(${swiftParameterName})`
          default:
            return swiftParameterName
        }
      }
      case 'array': {
        const array = getTypeAs(this.type, ArrayType)
        const wrapping = new SwiftCxxBridgedType(array.itemType)
        const cxxType = array.itemType.getCode('c++')
        const typeDecl = wrapping.canBePassedByReference
          ? `const auto&`
          : `auto`
        switch (language) {
          case 'c++':
            return `
[&]() -> std::vector<${cxxType}> {
  std::vector<${cxxType}> vector;
  vector.reserve(${swiftParameterName}.getCount());
  for (${typeDecl} i : ${swiftParameterName}) {
    vector.push_back(${wrapping.parseFromSwiftToCpp('i', language)});
  }
  return vector;
}()`.trim()
          default:
            return swiftParameterName
        }
      }
      case 'function':
        throw new Error(`Functions cannot be returned from Swift to C++ yet!`)
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
