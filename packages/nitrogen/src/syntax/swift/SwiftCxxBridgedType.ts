import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
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
import { VariantType } from '../types/VariantType.js'
import {
  createSwiftCxxHelpers,
  type SwiftCxxHelper,
} from './SwiftCxxTypeHelper.js'
import { createSwiftVariant, getSwiftVariantCaseName } from './SwiftVariant.js'

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
      case 'variant':
        // Variant_A_B_C <> std::variant<A, B, C>
        return true
      case 'function':
        // (@ecaping () -> Void) <> std::function<...>
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

  private getBridgeOrThrow(): SwiftCxxHelper {
    const bridge = this.getRequiredBridge()
    if (bridge == null)
      throw new Error(
        `Type ${this.type.kind} requires a bridged specialization!`
      )
    return bridge
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

    if (this.type.kind === 'variant') {
      const variant = getTypeAs(this.type, VariantType)
      const file = createSwiftVariant(variant)
      files.push(file)
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
      case 'optional':
      case 'array':
      case 'function':
      case 'variant':
      case 'record': {
        const bridge = this.getBridgeOrThrow()
        return NitroConfig.getCxxNamespace(language, bridge.specializationName)
      }
      case 'string': {
        switch (language) {
          case 'c++':
            return `std::string`
          case 'swift':
            return 'std.string'
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
        const optional = getTypeAs(this.type, OptionalType)
        const wrapping = new SwiftCxxBridgedType(optional.wrappingType)
        switch (language) {
          case 'swift':
            return `
{
  if let actualValue = ${cppParameterName}.value {
    return ${wrapping.parseFromCppToSwift('actualValue', language)}
  } else {
    return nil
  }
}()
  `.trim()
          default:
            return cppParameterName
        }
      }
      case 'string': {
        switch (language) {
          case 'swift':
            return `String(${cppParameterName})`
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
              return bridged.parseFromSwiftToCpp(p.escapedName, 'swift')
            })

            if (funcType.returnType.kind === 'void') {
              return `
{ ${signature} in
  ${cppParameterName}(${paramsForward.join(', ')})
}`.trim()
            } else {
              const resultBridged = new SwiftCxxBridgedType(funcType.returnType)
              return `
{ ${signature} in
  let result = ${cppParameterName}(${paramsForward.join(', ')})
  return ${resultBridged.parseFromSwiftToCpp('result', 'swift')}
}
              `.trim()
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
        const optional = getTypeAs(this.type, OptionalType)
        const wrapping = new SwiftCxxBridgedType(optional.wrappingType)
        const bridge = this.getBridgeOrThrow()
        const makeFunc = NitroConfig.getCxxNamespace(language, bridge.funcName)
        switch (language) {
          case 'swift':
            return `
{
  if let actualValue = ${swiftParameterName} {
    return ${makeFunc}(${wrapping.parseFromSwiftToCpp('actualValue', language)})
  } else {
    return .init()
  }
}()
  `.trim()
          default:
            return swiftParameterName
        }
      }
      case 'string': {
        switch (language) {
          case 'swift':
            return `std.string(${swiftParameterName})`
          default:
            return swiftParameterName
        }
      }
      case 'variant': {
        const bridge = this.getBridgeOrThrow()
        const makeFunc = NitroConfig.getCxxNamespace('swift', bridge.funcName)
        const variant = getTypeAs(this.type, VariantType)
        const cases = variant.variants
          .map((t) => {
            const caseName = getSwiftVariantCaseName(t)
            const wrapping = new SwiftCxxBridgedType(t)
            const parse = wrapping.parseFromSwiftToCpp('value', 'swift')
            return `case .${caseName}(let value):\n  return ${makeFunc}(${parse})`
          })
          .join('\n')
        switch (language) {
          case 'swift':
            return `
{
  switch ${swiftParameterName} {
    ${indent(cases, '    ')}
  }
}()`.trim()
          default:
            return swiftParameterName
        }
      }
      case 'array': {
        const bridge = this.getBridgeOrThrow()
        const makeFunc = NitroConfig.getCxxNamespace('swift', bridge.funcName)
        const array = getTypeAs(this.type, ArrayType)
        const wrapping = new SwiftCxxBridgedType(array.itemType)
        switch (language) {
          case 'swift':
            return `
{
  var vector = ${makeFunc}(${swiftParameterName}.count)
  for item in ${swiftParameterName} {
    vector.push_back(${wrapping.parseFromSwiftToCpp('item', language)})
  }
  return vector
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
