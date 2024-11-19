import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import type { BridgedType } from '../BridgedType.js'
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
import { PromiseType } from '../types/PromiseType.js'
import { RecordType } from '../types/RecordType.js'
import { StructType } from '../types/StructType.js'
import { TupleType } from '../types/TupleType.js'
import type { Type } from '../types/Type.js'
import { VariantType } from '../types/VariantType.js'
import { getReferencedTypes } from '../getReferencedTypes.js'
import {
  createSwiftCxxHelpers,
  type SwiftCxxHelper,
} from './SwiftCxxTypeHelper.js'
import { createSwiftEnumBridge } from './SwiftEnum.js'
import { createSwiftStructBridge } from './SwiftStruct.js'
import { createSwiftVariant, getSwiftVariantCaseName } from './SwiftVariant.js'

// TODO: Remove enum bridge once Swift fixes bidirectional enums crashing the `-Swift.h` header.

export class SwiftCxxBridgedType implements BridgedType<'swift', 'c++'> {
  readonly type: Type
  private readonly isBridgingToDirectCppTarget: boolean

  constructor(type: Type, isBridgingToDirectCppTarget: boolean = false) {
    this.type = type
    this.isBridgingToDirectCppTarget = isBridgingToDirectCppTarget
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
        if (this.isBridgingToDirectCppTarget) {
          // ...unless we bridge directly to a C++ target. Then we don't need special conversion.
          return false
        }
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
      case 'record':
        // Dictionary<K, V> <> std::unordered_map<K, V>
        return true
      case 'variant':
        // Variant_A_B_C <> std::variant<A, B, C>
        return true
      case 'tuple':
        // (A, B) <> std::tuple<A, B>
        return true
      case 'struct':
        // SomeStruct (Swift extension) <> SomeStruct (C++)
        return true
      case 'function':
        // (@ecaping () -> Void) <> std::function<...>
        return true
      case 'array-buffer':
        // ArrayBufferHolder <> std::shared_ptr<ArrayBuffer>
        if (this.isBridgingToDirectCppTarget) {
          return false
        }
        return true
      case 'promise':
        // Promise<T> <> std::shared_ptr<Promise<T>>
        return true
      case 'map':
        // AnyMapHolder <> AnyMap
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

    if (this.type.kind === 'array-buffer') {
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
    }

    // Recursively look into referenced types (e.g. the `T` of a `optional<T>`, or `T` of a `T[]`)
    const referencedTypes = getReferencedTypes(this.type)
    referencedTypes.forEach((t) => {
      if (t === this.type) {
        // break a recursion - we already know this type
        return
      }
      const bridged = new SwiftCxxBridgedType(t)
      imports.push(...bridged.getRequiredImports())
    })

    return imports
  }

  getExtraFiles(): SourceFile[] {
    const files: SourceFile[] = []

    switch (this.type.kind) {
      case 'struct': {
        const struct = getTypeAs(this.type, StructType)
        const extensionFile = createSwiftStructBridge(struct)
        files.push(extensionFile)
        extensionFile.referencedTypes.forEach((t) => {
          const bridge = new SwiftCxxBridgedType(t)
          files.push(...bridge.getExtraFiles())
        })
        break
      }
      case 'enum': {
        const enumType = getTypeAs(this.type, EnumType)
        const extensionFile = createSwiftEnumBridge(enumType)
        files.push(extensionFile)
        break
      }
      case 'variant': {
        const variant = getTypeAs(this.type, VariantType)
        const file = createSwiftVariant(variant)
        files.push(file)
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

  getTypeCode(language: 'swift' | 'c++'): string {
    switch (this.type.kind) {
      case 'enum':
        if (this.isBridgingToDirectCppTarget) {
          return this.type.getCode('swift')
        }
        switch (language) {
          case 'c++':
            return 'int'
          case 'swift':
            return 'Int32'
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      case 'map': {
        switch (language) {
          case 'swift':
            return 'margelo.nitro.TSharedMap'
          default:
            return this.type.getCode(language)
        }
      }
      case 'hybrid-object':
      case 'optional':
      case 'array':
      case 'function':
      case 'variant':
      case 'tuple':
      case 'record':
      case 'promise': {
        const bridge = this.getBridgeOrThrow()
        switch (language) {
          case 'swift':
            return `bridge.${bridge.specializationName}`
          case 'c++':
            return bridge.cxxType
          default:
            return this.type.getCode(language)
        }
      }
      case 'array-buffer':
        if (this.isBridgingToDirectCppTarget) {
          return this.type.getCode(language)
        } else {
          return `ArrayBufferHolder`
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
      case 'enum': {
        if (this.isBridgingToDirectCppTarget) {
          return cppParameterName
        }
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
      }
      case 'hybrid-object': {
        const bridge = this.getBridgeOrThrow()
        const getFunc = `bridge.get_${bridge.specializationName}`
        const name = getTypeHybridObjectName(this.type)
        switch (language) {
          case 'swift':
            return `
{ () -> ${name.HybridTSpec} in
  let __unsafePointer = ${getFunc}(${cppParameterName})
  let __instance = ${name.HybridTSpecCxx}Unsafe.fromUnsafe(__unsafePointer)
  return __instance.get${name.HybridTSpec}()
}()`.trim()
          default:
            return cppParameterName
        }
      }
      case 'array-buffer': {
        switch (language) {
          case 'swift':
            if (this.isBridgingToDirectCppTarget) {
              return `ArrayBufferHolder(${cppParameterName})`
            } else {
              return cppParameterName
            }
          case 'c++':
            if (this.isBridgingToDirectCppTarget) {
              return cppParameterName
            } else {
              return `ArrayBufferHolder(${cppParameterName})`
            }
          default:
            return cppParameterName
        }
      }
      case 'promise': {
        switch (language) {
          case 'c++':
            return `[]() -> ${this.getTypeCode('c++')} { throw std::runtime_error("Promise<..> cannot be converted to Swift yet!"); }()`
          default:
            return cppParameterName
        }
      }
      case 'optional': {
        const optional = getTypeAs(this.type, OptionalType)
        const wrapping = new SwiftCxxBridgedType(optional.wrappingType, true)
        switch (language) {
          case 'swift':
            if (wrapping.type.kind === 'enum') {
              const enumType = getTypeAs(wrapping.type, EnumType)
              if (enumType.jsType === 'enum') {
                // TODO: Remove this hack once Swift fixes this shit.
                // A JS enum is implemented as a number/int based enum.
                // For some reason, those break in Swift. I have no idea why.
                return `${cppParameterName}.has_value() ? ${cppParameterName}.pointee : nil`
              }
            }
            if (!wrapping.needsSpecialHandling) {
              return `${cppParameterName}.value`
            }
            return `
{ () -> ${optional.getCode('swift')} in
  if let __unwrapped = ${cppParameterName}.value {
    return ${indent(wrapping.parseFromCppToSwift('__unwrapped', language), '    ')}
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
      case 'array': {
        const array = getTypeAs(this.type, ArrayType)
        const wrapping = new SwiftCxxBridgedType(array.itemType, true)
        switch (language) {
          case 'swift':
            return `${cppParameterName}.map({ __item in ${wrapping.parseFromCppToSwift('__item', 'swift')} })`.trim()
          default:
            return cppParameterName
        }
      }
      case 'map': {
        switch (language) {
          case 'swift':
            return `AnyMapHolder(withCppPart: ${cppParameterName})`
          default:
            return cppParameterName
        }
      }
      case 'record': {
        const bridge = this.getBridgeOrThrow()
        const getKeysFunc = `bridge.get_${bridge.specializationName}_keys`
        const record = getTypeAs(this.type, RecordType)
        const wrappingKey = new SwiftCxxBridgedType(record.keyType)
        const wrappingValue = new SwiftCxxBridgedType(record.valueType)
        switch (language) {
          case 'swift':
            return `
{ () -> ${record.getCode('swift')} in
  var __dictionary = ${record.getCode('swift')}(minimumCapacity: ${cppParameterName}.size())
  let __keys = ${getKeysFunc}(${cppParameterName})
  for __key in __keys {
    let __value = ${cppParameterName}[__key]!
    __dictionary[${wrappingKey.parseFromCppToSwift('__key', 'swift')}] = ${wrappingValue.parseFromCppToSwift('__value', 'swift')}
  }
  return __dictionary
}()`.trim()
          default:
            return cppParameterName
        }
      }
      case 'tuple': {
        switch (language) {
          case 'swift':
            return `${cppParameterName}.arg0`
          default:
            return cppParameterName
        }
      }
      case 'variant': {
        const bridge = this.getBridgeOrThrow()
        const variant = getTypeAs(this.type, VariantType)
        const cases = variant.variants
          .map((t, i) => {
            const getFunc = `bridge.get_${bridge.specializationName}_${i}`
            const wrapping = new SwiftCxxBridgedType(t)
            const caseName = getSwiftVariantCaseName(t)
            return `
case ${i}:
  let __actual = ${getFunc}(${cppParameterName})
  return .${caseName}(${indent(wrapping.parseFromCppToSwift('__actual', 'swift'), '  ')})`.trim()
          })
          .join('\n')
        switch (language) {
          case 'swift':
            return `
{ () -> ${variant.getCode('swift')} in
  switch ${cppParameterName}.index() {
    ${indent(cases, '    ')}
    default:
      fatalError("Variant can never have index \\(${cppParameterName}.index())!")
  }
}()`.trim()
          default:
            return cppParameterName
        }
      }
      case 'function': {
        const funcType = getTypeAs(this.type, FunctionType)
        switch (language) {
          case 'swift':
            const swiftClosureType = funcType.getCode('swift', false)
            const bridge = this.getBridgeOrThrow()
            const paramsSignature = funcType.parameters.map(
              (p) => `__${p.escapedName}: ${p.getCode('swift')}`
            )
            const returnType = funcType.returnType.getCode('swift')
            const signature = `(${paramsSignature.join(', ')}) -> ${returnType}`
            const paramsForward = funcType.parameters.map((p) => {
              const bridged = new SwiftCxxBridgedType(p)
              return bridged.parseFromSwiftToCpp(`__${p.escapedName}`, 'swift')
            })

            if (funcType.returnType.kind === 'void') {
              return `
{ () -> ${swiftClosureType} in
  let __sharedClosure = bridge.share_${bridge.specializationName}(${cppParameterName})
  return { ${signature} in
    __sharedClosure.pointee.call(${indent(paramsForward.join(', '), '  ')})
  }
}()`.trim()
            } else {
              const resultBridged = new SwiftCxxBridgedType(funcType.returnType)
              return `
{ () -> ${swiftClosureType} in
  let __sharedClosure = bridge.share_${bridge.specializationName}(${cppParameterName})
  return { ${signature} in
    let __result = __sharedClosure.pointee.call(${paramsForward.join(', ')})
    return ${indent(resultBridged.parseFromSwiftToCpp('__result', 'swift'), '  ')}
  }
}()`.trim()
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
        if (this.isBridgingToDirectCppTarget) {
          return swiftParameterName
        }
        switch (language) {
          case 'c++':
            return `static_cast<${this.type.getCode('c++')}>(${swiftParameterName})`
          case 'swift':
            return `${swiftParameterName}.rawValue`
          default:
            throw new Error(`Invalid language! ${language}`)
        }
      case 'hybrid-object': {
        const bridge = this.getBridgeOrThrow()
        const name = getTypeHybridObjectName(this.type)
        const makeFunc = `bridge.${bridge.funcName}`
        switch (language) {
          case 'swift':
            return `
{ () -> bridge.${bridge.specializationName} in
  let __cxxWrapped = ${name.HybridTSpecCxx}(${swiftParameterName})
  let __pointer = ${name.HybridTSpecCxx}Unsafe.toUnsafe(__cxxWrapped)
  return ${makeFunc}(__pointer)
}()`.trim()
          default:
            return swiftParameterName
        }
      }
      case 'optional': {
        const optional = getTypeAs(this.type, OptionalType)
        const wrapping = new SwiftCxxBridgedType(optional.wrappingType, true)
        const bridge = this.getBridgeOrThrow()
        const makeFunc = `bridge.${bridge.funcName}`
        switch (language) {
          case 'swift':
            return `
{ () -> bridge.${bridge.specializationName} in
  if let __unwrappedValue = ${swiftParameterName} {
    return ${makeFunc}(${indent(wrapping.parseFromSwiftToCpp('__unwrappedValue', language), '    ')})
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
      case 'array-buffer': {
        switch (language) {
          case 'swift':
            if (this.isBridgingToDirectCppTarget) {
              return `${swiftParameterName}.getArrayBuffer()`
            } else {
              return swiftParameterName
            }
          case 'c++':
            if (this.isBridgingToDirectCppTarget) {
              return swiftParameterName
            } else {
              return `${swiftParameterName}.getArrayBuffer()`
            }
          default:
            return swiftParameterName
        }
      }
      case 'map': {
        switch (language) {
          case 'swift':
            return `${swiftParameterName}.cppPart`
          default:
            return swiftParameterName
        }
      }
      case 'promise': {
        const bridge = this.getBridgeOrThrow()
        const makePromise = `bridge.${bridge.funcName}`
        const promise = getTypeAs(this.type, PromiseType)
        const resolvingType = new SwiftCxxBridgedType(
          promise.resultingType,
          true
        )
        switch (language) {
          case 'c++':
            return swiftParameterName
          case 'swift':
            const arg =
              promise.resultingType.kind === 'void'
                ? ''
                : resolvingType.parseFromSwiftToCpp('__result', 'swift')
            return `
{ () -> bridge.${bridge.specializationName} in
  let __promise = ${makePromise}()
  ${swiftParameterName}
    .then({ __result in __promise.pointee.resolve(${arg}) })
    .catch({ __error in __promise.pointee.reject(std.string(String(describing: __error))) })
  return __promise
}()`.trim()
          default:
            return swiftParameterName
        }
      }
      case 'array': {
        const bridge = this.getBridgeOrThrow()
        const makeFunc = `bridge.${bridge.funcName}`
        const array = getTypeAs(this.type, ArrayType)
        const wrapping = new SwiftCxxBridgedType(array.itemType, true)
        switch (language) {
          case 'swift':
            return `
{ () -> bridge.${bridge.specializationName} in
  var __vector = ${makeFunc}(${swiftParameterName}.count)
  for __item in ${swiftParameterName} {
    __vector.push_back(${indent(wrapping.parseFromSwiftToCpp('__item', language), '    ')})
  }
  return __vector
}()`.trim()
          default:
            return swiftParameterName
        }
      }
      case 'tuple': {
        const tuple = getTypeAs(this.type, TupleType)
        const bridge = this.getBridgeOrThrow()
        const makeFunc = NitroConfig.getCxxNamespace(language, bridge.funcName)
        switch (language) {
          case 'swift':
            const typesForward = tuple.itemTypes
              .map((t, i) => {
                const bridged = new SwiftCxxBridgedType(t)
                return `${bridged.parseFromSwiftToCpp(`${swiftParameterName}.${i}`, language)}`
              })
              .join(', ')
            return `${makeFunc}(${typesForward})`
          default:
            return swiftParameterName
        }
      }
      case 'variant': {
        const bridge = this.getBridgeOrThrow()
        const variant = getTypeAs(this.type, VariantType)
        switch (language) {
          case 'swift':
            const cases = variant.variants
              .map((t) => {
                const caseName = getSwiftVariantCaseName(t)
                const wrapping = new SwiftCxxBridgedType(t)
                const parse = wrapping.parseFromSwiftToCpp('__value', 'swift')
                return `case .${caseName}(let __value):\n  return bridge.${bridge.funcName}(${parse})`
              })
              .join('\n')
            return `
{ () -> bridge.${bridge.specializationName} in
  switch ${swiftParameterName} {
    ${indent(cases, '    ')}
  }
}()`.trim()
          default:
            return swiftParameterName
        }
      }
      case 'record': {
        const bridge = this.getBridgeOrThrow()
        const createMap = `bridge.${bridge.funcName}`
        const record = getTypeAs(this.type, RecordType)
        const wrappingKey = new SwiftCxxBridgedType(record.keyType)
        const wrappingValue = new SwiftCxxBridgedType(record.valueType)
        switch (language) {
          case 'swift':
            return `
{ () -> bridge.${bridge.specializationName} in
  var __map = ${createMap}(${swiftParameterName}.count)
  for (__k, __v) in ${swiftParameterName} {
    __map[${indent(wrappingKey.parseFromSwiftToCpp('__k', 'swift'), '    ')}] = ${indent(wrappingValue.parseFromSwiftToCpp('__v', 'swift'), '    ')}
  }
  return __map
}()`.trim()
          default:
            return swiftParameterName
        }
      }
      case 'function': {
        switch (language) {
          case 'swift': {
            const bridge = this.getBridgeOrThrow()
            const func = getTypeAs(this.type, FunctionType)
            const cFuncParamsForward = func.parameters
              .map((p) => {
                const bridged = new SwiftCxxBridgedType(p)
                return bridged.parseFromCppToSwift(
                  `__${p.escapedName}`,
                  'swift'
                )
              })
              .join(', ')
            const paramsSignature = func.parameters
              .map((p) => `_ __${p.escapedName}: ${p.getCode('swift')}`)
              .join(', ')
            const paramsForward = func.parameters
              .map((p) => `__${p.escapedName}`)
              .join(', ')
            const cFuncParamsSignature = [
              '__closureHolder: UnsafeMutableRawPointer?',
              ...func.parameters.map((p) => {
                const bridged = new SwiftCxxBridgedType(p)
                return `__${p.escapedName}: ${bridged.getTypeCode('swift')}`
              }),
            ].join(', ')
            const createFunc = `bridge.${bridge.funcName}`
            return `
{ () -> bridge.${bridge.specializationName} in
  class ClosureHolder {
    let closure: ${func.getCode('swift')}
    init(wrappingClosure closure: @escaping ${func.getCode('swift')}) {
      self.closure = closure
    }
    func invoke(${paramsSignature}) {
      self.closure(${indent(paramsForward, '    ')})
    }
  }

  let __closureHolder = Unmanaged.passRetained(ClosureHolder(wrappingClosure: ${swiftParameterName})).toOpaque()
  func __callClosure(${cFuncParamsSignature}) -> Void {
    let closure = Unmanaged<ClosureHolder>.fromOpaque(__closureHolder!).takeUnretainedValue()
    closure.invoke(${indent(cFuncParamsForward, '    ')})
  }
  func __destroyClosure(_ __closureHolder: UnsafeMutableRawPointer?) -> Void {
    Unmanaged<ClosureHolder>.fromOpaque(__closureHolder!).release()
  }

  return ${createFunc}(__closureHolder, __callClosure, __destroyClosure)
}()
  `.trim()
          }
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
