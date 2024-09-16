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
        // PromiseHolder<T> <> std::shared_ptr<std::promise<T>>
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
    } else if (this.type.kind === 'array-buffer') {
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
    } else if (this.type.kind === 'promise') {
      imports.push({
        name: 'NitroModules/PromiseHolder.hpp',
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
      case 'map': {
        switch (language) {
          case 'swift':
            return 'margelo.nitro.TSharedMap'
          default:
            return this.type.getCode(language)
        }
      }
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
      case 'enum':
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
            if (!wrapping.needsSpecialHandling) {
              return `${cppParameterName}.value`
            }
            return `
{ () -> ${optional.getCode('swift')} in
  if let actualValue = ${cppParameterName}.value {
    return ${indent(wrapping.parseFromCppToSwift('actualValue', language), '    ')}
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
        const wrapping = new SwiftCxxBridgedType(array.itemType)
        switch (language) {
          case 'swift':
            return `${cppParameterName}.map({ val in ${wrapping.parseFromCppToSwift('val', 'swift')} })`.trim()
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
  var dictionary = ${record.getCode('swift')}(minimumCapacity: ${cppParameterName}.size())
  let keys = ${getKeysFunc}(${cppParameterName})
  for key in keys {
    let value = ${cppParameterName}[key]!
    dictionary[${wrappingKey.parseFromCppToSwift('key', 'swift')}] = ${wrappingValue.parseFromCppToSwift('value', 'swift')}
  }
  return dictionary
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
  let actual = ${getFunc}(${cppParameterName})
  return .${caseName}(${indent(wrapping.parseFromCppToSwift('actual', 'swift'), '  ')})`.trim()
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
{ () -> ${swiftClosureType} in
  let shared = bridge.share_${bridge.specializationName}(${cppParameterName})
  return { ${signature} in
    shared.pointee.call(${indent(paramsForward.join(', '), '  ')})
  }
}()`.trim()
            } else {
              const resultBridged = new SwiftCxxBridgedType(funcType.returnType)
              return `
{ () -> ${swiftClosureType} in
  let shared = bridge.share_${bridge.specializationName}(${cppParameterName})
  return { ${signature} in
    let result = shared.pointee.call(${paramsForward.join(', ')})
    return ${indent(resultBridged.parseFromSwiftToCpp('result', 'swift'), '  ')}
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
        const wrapping = new SwiftCxxBridgedType(optional.wrappingType, true)
        const bridge = this.getBridgeOrThrow()
        const makeFunc = `bridge.${bridge.funcName}`
        switch (language) {
          case 'swift':
            return `
{ () -> bridge.${bridge.specializationName} in
  if let actualValue = ${swiftParameterName} {
    return ${makeFunc}(${indent(wrapping.parseFromSwiftToCpp('actualValue', language), '    ')})
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
        const resolvingType = new SwiftCxxBridgedType(promise.resultingType)
        switch (language) {
          case 'c++':
            return `${swiftParameterName}.getFuture()`
          case 'swift':
            const arg =
              promise.resultingType.kind === 'void'
                ? ''
                : resolvingType.parseFromSwiftToCpp('__result', 'swift')
            return `
{ () -> bridge.${bridge.specializationName} in
  let promiseHolder = ${makePromise}()
  ${swiftParameterName}
    .then({ __result in promiseHolder.resolve(${arg}) })
    .catch({ __error in promiseHolder.reject(std.string(String(describing: __error))) })
  return promiseHolder
}()`.trim()
          default:
            return swiftParameterName
        }
      }
      case 'array': {
        const bridge = this.getBridgeOrThrow()
        const makeFunc = `bridge.${bridge.funcName}`
        const array = getTypeAs(this.type, ArrayType)
        const wrapping = new SwiftCxxBridgedType(array.itemType)
        switch (language) {
          case 'swift':
            return `
{ () -> bridge.${bridge.specializationName} in
  var vector = ${makeFunc}(${swiftParameterName}.count)
  for item in ${swiftParameterName} {
    vector.push_back(${indent(wrapping.parseFromSwiftToCpp('item', language), '    ')})
  }
  return vector
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
  var map = ${createMap}(${swiftParameterName}.count)
  for (k, v) in ${swiftParameterName} {
    map[${indent(wrappingKey.parseFromSwiftToCpp('k', 'swift'), '    ')}] = ${indent(wrappingValue.parseFromSwiftToCpp('v', 'swift'), '    ')}
  }
  return map
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
                return bridged.parseFromCppToSwift(p.escapedName, 'swift')
              })
              .join(', ')
            const paramsSignature = func.parameters
              .map((p) => `_ ${p.escapedName}: ${p.getCode('swift')}`)
              .join(', ')
            const paramsForward = func.parameters
              .map((p) => p.escapedName)
              .join(', ')
            const cFuncParamsSignature = [
              'closureHolder: UnsafeMutableRawPointer?',
              ...func.parameters.map((p) => {
                const bridged = new SwiftCxxBridgedType(p)
                return `${p.escapedName}: ${bridged.getTypeCode('swift')}`
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

  let closureHolder = Unmanaged.passRetained(ClosureHolder(wrappingClosure: ${swiftParameterName})).toOpaque()
  func callClosure(${cFuncParamsSignature}) -> Void {
    let closure = Unmanaged<ClosureHolder>.fromOpaque(closureHolder!).takeUnretainedValue()
    closure.invoke(${indent(cFuncParamsForward, '    ')})
  }
  func destroyClosure(_ closureHolder: UnsafeMutableRawPointer?) -> Void {
    Unmanaged<ClosureHolder>.fromOpaque(closureHolder!).release()
  }

  return ${createFunc}(closureHolder, callClosure, destroyClosure)
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
