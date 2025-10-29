import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'
import type { Property } from '../Property.js'
import { indent } from '../../utils.js'
import type { Method } from '../Method.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import { includeHeader } from '../c++/includeNitroHeader.js'
import { getUmbrellaHeaderName } from '../../autolinking/ios/createSwiftUmbrellaHeader.js'
import { HybridObjectType } from '../types/HybridObjectType.js'
import { addKnownType } from '../createType.js'
import { ResultWrappingType } from '../types/ResultWrappingType.js'

/**
 * Creates a Swift class that bridges Swift over to C++.
 * We need this because not all Swift types are accessible in C++, and vice versa.
 *
 * For example, Enums need to be converted to Int32 (because of a Swift compiler bug),
 * Promise<..> has to be converted to a Promise<..>, exceptions have to be handled
 * via custom Result types, etc..
 */
export function createSwiftHybridObjectCxxBridge(
  spec: HybridObjectSpec
): SourceFile[] {
  const name = getHybridObjectName(spec.name)
  const bridgeNamespace = spec.config.getSwiftBridgeNamespace('swift')
  const cxxNamespace = spec.config.getCxxNamespace('c++')
  const iosModuleName = spec.config.getIosModuleName()

  const propertiesBridge = spec.properties.map((p) =>
    getPropertyForwardImplementation(p)
  )

  const methodsBridge = spec.methods.map((m) =>
    getMethodForwardImplementation(m)
  )

  const baseClasses = spec.baseTypes.map((base) => {
    const baseName = getHybridObjectName(base.name)
    return baseName.HybridTSpecCxx
  })
  const hasBase = baseClasses.length > 0

  if (spec.isHybridView && !hasBase) {
    methodsBridge.push(
      `
public static func getView(this: UnsafeMutableRawPointer) -> UnsafeMutableRawPointer {
  let __instance = cast(this)
  return Unmanaged.passRetained(__instance.view).toOpaque()
}
`.trim(),
      `
public static func beforeUpdate(this: UnsafeMutableRawPointer) {
  let __instance = cast(this)
  __instance.beforeUpdate()
}
  `.trim(),
      `
public static func afterUpdate(this: UnsafeMutableRawPointer) {
  let __instance = cast(this)
  __instance.afterUpdate()
}
`.trim()
    )
  }

  const hybridObject = new HybridObjectType(spec)
  const bridgedType = new SwiftCxxBridgedType(hybridObject)
  if (bridgedType.getRequiredBridge() == null)
    throw new Error(`HybridObject Type should have a bridge!`)

  const imports = ['import NitroModules']
  const extraSwiftImports = [
    ...spec.properties.flatMap((p) => p.getRequiredImports('swift')),
    ...spec.methods.flatMap((m) => m.getRequiredImports('swift')),
  ]
  imports.push(
    ...extraSwiftImports.map((i) => `import ${i.name}`).filter(isNotDuplicate)
  )

  const swiftCxxWrapperCode = `
${createFileMetadataString(`${name.HybridTSpecCxx}.swift`)}

import Foundation
${imports.join('\n')}

/**
 * A class implementation that bridges ${name.HybridTSpec} over to C++.
 * In C++, we cannot use Swift protocols - so we need to wrap it in a class to make it strongly defined.
 *
 * Also, some Swift types need to be bridged with special handling:
 * - Enums need to be wrapped in Structs, otherwise they cannot be accessed bi-directionally (Swift bug: https://github.com/swiftlang/swift/issues/75330)
 * - Other HybridObjects need to be wrapped/unwrapped from the Swift TCxx wrapper
 * - Throwing methods need to be wrapped with a Result<T, Error> type, as exceptions cannot be propagated to C++
 */
public class ${name.HybridTSpecCxx} {
  /**
   * The Swift <> C++ bridge's namespace (\`${NitroConfig.current.getSwiftBridgeNamespace('c++')}\`)
   * from \`${iosModuleName}-Swift-Cxx-Bridge.hpp\`.
   * This contains specialized C++ templates, and C++ helper functions that can be accessed from Swift.
   */
  public typealias bridge = ${bridgeNamespace}

  /**
   * +1 Retain one ref count of the given \`UnsafeRawPointer\`
   */
  @inline(__always)
  public static func retainOne(_ this: UnsafeRawPointer) {
    let _ = Unmanaged<AnyObject>.fromOpaque(this).retain()
  }

  /**
   * -1 Release one ref count of the given \`UnsafeRawPointer\`
   */
  @inline(__always)
  public static func releaseOne(_ this: UnsafeRawPointer) {
    Unmanaged<AnyObject>.fromOpaque(this).release()
  }

  @inline(__always)
  private static func cast(_ this: UnsafeRawPointer) -> ${name.HybridTSpec} {
    return HybridObjectFromUnsafe(this)
  }

  /**
   * Get the memory size of the Swift class (plus size of any other allocations)
   * so the JS VM can properly track it and garbage-collect the JS object if needed.
   */
  @inline(__always)
  public static func getMemorySize(this: UnsafeRawPointer) -> Int {
    let __instance = cast(this)
    return MemoryHelper.getSizeOf(__instance) + __instance.memorySize
  }

  /**
   * Call dispose() on the Swift class.
   * This _may_ be called manually from JS.
   */
  @inline(__always)
  public static func dispose(this: UnsafeRawPointer) {
    let __instance = cast(this)
    __instance.dispose()
  }

  /**
   * Call toString() on the Swift class.
   */
  @inline(__always)
  public static func toString(this: UnsafeRawPointer) -> String {
    let __instance = cast(this)
    return __instance.toString()
  }

  /**
   * Call equals() on the Swift class.
   */
  @inline(__always)
  public static func equals(this: UnsafeRawPointer, other: UnsafeRawPointer) -> Bool {
    let __instance = cast(this)
    let __other = cast(other)
    return __instance === __other
  }

  // Properties
  ${indent(propertiesBridge.join('\n\n'), '  ')}

  // Methods
  ${indent(methodsBridge.join('\n\n'), '  ')}
}
  `

  const cppPropertyDeclarations = spec.properties
    .map((p) => p.getCode('c++', { noexcept: true, override: true }))
    .join('\n')
  const cppMethodDeclarations = spec.methods
    .map((p) => p.getCode('c++', { override: true }))
    .join('\n')

  const cppPropertyImplementations = spec.properties
    .map((p) => {
      const bridged = new SwiftCxxBridgedType(p.type)
      let getter: string
      let setter: string

      const getterName = p.getGetterName('swift')
      const setterName = p.getSetterName('swift')
      if (bridged.needsSpecialHandling) {
        // we need custom C++ -> Swift conversion code
        getter = `
auto __result = ${iosModuleName}::${name.HybridTSpecCxx}::${getterName}(_swiftPart);
return ${bridged.parseFromSwiftToCpp('__result', 'c++')};
`
        setter = `${iosModuleName}::${name.HybridTSpecCxx}::${setterName}(_swiftPart, ${bridged.parseFromCppToSwift(p.name, 'c++')});`
      } else {
        // just forward value directly
        getter = `return ${iosModuleName}::${name.HybridTSpecCxx}::${getterName}(_swiftPart);`
        setter = `${iosModuleName}::${name.HybridTSpecCxx}::${setterName}(_swiftPart, std::forward<decltype(${p.name})>(${p.name}));`
      }
      return p.getCode(
        'c++',
        {
          noexcept: true,
          classDefinitionName: name.HybridTSpecSwift,
        },
        {
          getter: getter.trim(),
          setter: setter.trim(),
        }
      )
    })
    .join('\n')

  const cppMethodImplementations = spec.methods
    .map((m) => {
      const params = ['_swiftPart']
      params.push(
        ...m.parameters.map((p) => {
          const bridged = new SwiftCxxBridgedType(p.type)
          if (bridged.needsSpecialHandling) {
            // we need custom C++ -> Swift conversion code
            return bridged.parseFromCppToSwift(p.name, 'c++')
          } else {
            // just forward value directly
            return `std::forward<decltype(${p.name})>(${p.name})`
          }
        })
      )

      const bridgedReturnType = new SwiftCxxBridgedType(m.returnType, true)
      const hasResult = m.returnType.kind !== 'void'
      let body: string
      if (hasResult) {
        // func returns something
        body = `
auto __result = ${iosModuleName}::${name.HybridTSpecCxx}::${m.name}(${params.join(', ')});
if (__result.hasError()) [[unlikely]] {
  std::rethrow_exception(__result.error());
}
auto __value = std::move(__result.value());
return ${bridgedReturnType.parseFromSwiftToCpp('__value', 'c++')};
        `.trim()
      } else {
        // void func
        body = `
auto __result = ${iosModuleName}::${name.HybridTSpecCxx}::${m.name}(${params.join(', ')});
if (__result.hasError()) [[unlikely]] {
  std::rethrow_exception(__result.error());
}
        `.trim()
      }

      return m.getCode(
        'c++',
        {
          classDefinitionName: name.HybridTSpecSwift,
        },
        body
      )
    })
    .join('\n')

  const allBridgedTypes = [
    ...spec.properties.flatMap((p) => new SwiftCxxBridgedType(p.type)),
    ...spec.methods.flatMap((m) => {
      const bridgedReturn = new SwiftCxxBridgedType(m.returnType)
      const bridgedParams = m.parameters.map(
        (p) => new SwiftCxxBridgedType(p.type)
      )
      return [bridgedReturn, ...bridgedParams]
    }),
  ]
  const extraImports = allBridgedTypes.flatMap((b) =>
    b.getRequiredImports('c++')
  )

  const cppBaseClasses = [`public virtual ${name.HybridTSpec}`]
  const cppBaseCtorCalls = [`HybridObject(${name.HybridTSpec}::TAG)`]
  for (const base of spec.baseTypes) {
    const baseName = getHybridObjectName(base.name)
    cppBaseClasses.push(`public virtual ${baseName.HybridTSpecSwift}`)
    cppBaseCtorCalls.push(`${baseName.HybridTSpecSwift}(swiftPart)`)
    extraImports.push({
      language: 'c++',
      name: `${baseName.HybridTSpecSwift}.hpp`,
      space: 'user',
      forwardDeclaration: getForwardDeclaration(
        'class',
        baseName.HybridTSpecSwift,
        cxxNamespace
      ),
    })
  }

  const extraForwardDeclarations = extraImports
    .map((i) => i.forwardDeclaration)
    .filter((v) => v != null)
    .filter(isNotDuplicate)
  const extraIncludes = extraImports
    .map((i) => includeHeader(i))
    .filter(isNotDuplicate)

  // TODO: Remove forward declaration once Swift fixes the wrong order in generated -Swift.h headers!
  const cppHybridObjectCode = `
${createFileMetadataString(`${name.HybridTSpecSwift}.hpp`)}

#pragma once

#include "${name.HybridTSpec}.hpp"

${extraForwardDeclarations.join('\n')}

${extraIncludes.join('\n')}

namespace ${cxxNamespace} {

  /**
   * The C++ part of ${name.HybridTSpecCxx}.swift.
   *
   * ${name.HybridTSpecSwift} (C++) accesses ${name.HybridTSpecCxx} (Swift), and might
   * contain some additional bridging code for C++ <> Swift interop.
   *
   * Since this obviously introduces an overhead, I hope at some point in
   * the future, ${name.HybridTSpecCxx} can directly inherit from the C++ class ${name.HybridTSpec}
   * to simplify the whole structure and memory management.
   */
  class ${name.HybridTSpecSwift}: ${cppBaseClasses.join(', ')} {
  public:
    // Constructor from a Swift instance
    explicit ${name.HybridTSpecSwift}(void* NON_NULL /* retain +1 */ swiftPart);
    // Destructor calls release in Swift
    ~${name.HybridTSpecSwift}() override;
    // Copy & Move is deleted
    ${name.HybridTSpecSwift}(const ${name.HybridTSpecSwift}&) = delete;
    ${name.HybridTSpecSwift}(${name.HybridTSpecSwift}&&) = delete;

  public:
    // Get the Swift part
    inline void* NON_NULL getSwiftPart() noexcept {
      return _swiftPart;
    }

  public:
    size_t getExternalMemorySize() noexcept override;
    void dispose() noexcept override;
    std::string toString() override;
    bool equals(const std::shared_ptr<HybridObject>& other) override;

  public:
    // Properties
    ${indent(cppPropertyDeclarations, '    ')}

  public:
    // Methods
    ${indent(cppMethodDeclarations, '    ')}

  private:
    void* NON_NULL /* retain +1 */ _swiftPart;
  };

} // namespace ${cxxNamespace}
  `
  const cppHybridObjectCodeCpp = `
${createFileMetadataString(`${name.HybridTSpecSwift}.cpp`)}

#include "${name.HybridTSpecSwift}.hpp"
#include "${getUmbrellaHeaderName()}"

namespace ${cxxNamespace} {

  ${name.HybridTSpecSwift}::${name.HybridTSpecSwift}(void* NON_NULL /* retain +1 */ swiftPart):
    ${indent(cppBaseCtorCalls.join(',\n'), '    ')},
    _swiftPart(swiftPart) {
    ${iosModuleName}::${name.HybridTSpecCxx}::retainOne(_swiftPart);
  }
  ${name.HybridTSpecSwift}::~${name.HybridTSpecSwift}() {
    ${iosModuleName}::${name.HybridTSpecCxx}::releaseOne(_swiftPart);
  }

  size_t ${name.HybridTSpecSwift}::getExternalMemorySize() noexcept {
    return ${iosModuleName}::${name.HybridTSpecCxx}::getMemorySize(_swiftPart);
  }
  void ${name.HybridTSpecSwift}::dispose() noexcept {
    return ${iosModuleName}::${name.HybridTSpecCxx}::dispose(_swiftPart);
  }
  std::string ${name.HybridTSpecSwift}::toString() {
    return ${iosModuleName}::${name.HybridTSpecCxx}::toString(_swiftPart);
  }
  bool ${name.HybridTSpecSwift}::equals(const std::shared_ptr<HybridObject>& other) {
    const auto& swiftOther = std::dynamic_pointer_cast<${name.HybridTSpecSwift}>(other);
    if (swiftOther == nullptr) {
      return false;
    }
    return ${iosModuleName}::${name.HybridTSpecCxx}::equals(_swiftPart, swiftOther->getSwiftPart());
  }

  ${indent(cppPropertyImplementations, '  ')}

  ${indent(cppMethodImplementations, '  ')}

} // namespace ${cxxNamespace}
  `

  const files: SourceFile[] = []
  files.push(...allBridgedTypes.flatMap((b) => b.getExtraFiles()))
  files.push({
    content: swiftCxxWrapperCode,
    language: 'swift',
    name: `${name.HybridTSpecCxx}.swift`,
    subdirectory: [],
    platform: 'ios',
  })
  files.push({
    content: cppHybridObjectCode,
    language: 'c++',
    name: `${name.HybridTSpecSwift}.hpp`,
    subdirectory: [],
    platform: 'ios',
  })
  files.push({
    content: cppHybridObjectCodeCpp,
    language: 'c++',
    name: `${name.HybridTSpecSwift}.cpp`,
    subdirectory: [],
    platform: 'ios',
  })
  return files
}

function getPropertyForwardImplementation(property: Property): string {
  const bridgedType = new SwiftCxxBridgedType(property.type)
  const methods: string[] = []
  // getter
  methods.push(
    `
@inline(__always)
public static func ${property.getGetterName('swift')}(this: UnsafeRawPointer) -> ${bridgedType.getTypeCode('swift')} {
  let __instance = cast(this)
  let __value = __instance.${property.name}
  return ${indent(bridgedType.parseFromSwiftToCpp('__value', 'swift'), '  ')}
}
`.trim()
  )
  if (!property.isReadonly) {
    // + setter
    methods.push(
      `

@inline(__always)
public static func ${property.getSetterName('swift')}(this: UnsafeRawPointer, newValue: ${bridgedType.getTypeCode('swift')}) {
  let __instance = cast(this)
  __instance.${property.name} = ${indent(bridgedType.parseFromCppToSwift('newValue', 'swift'), '  ')}
}
  `.trim()
    )
  }

  return methods.join('\n')
}

function getMethodForwardImplementation(method: Method): string {
  // wrapped return in a std::expected
  const resultType = new ResultWrappingType(method.returnType)
  addKnownType(`expected_${resultType.getCode('c++')}`, resultType, 'swift')
  const bridgedResultType = new SwiftCxxBridgedType(resultType, true)
  const resultBridge = bridgedResultType.getRequiredBridge()
  if (resultBridge == null)
    throw new Error(
      `Result type (${bridgedResultType.getTypeCode('c++')}) does not have a bridge!`
    )
  const bridgedErrorType = new SwiftCxxBridgedType(resultType.error, true)

  const returnType = new SwiftCxxBridgedType(method.returnType, true)
  const params = ['this: UnsafeRawPointer']
  params.push(
    ...method.parameters.map((p) => {
      const bridgedType = new SwiftCxxBridgedType(p.type)
      return `${p.name}: ${bridgedType.getTypeCode('swift')}`
    })
  )
  const passParams = method.parameters.map((p) => {
    const bridgedType = new SwiftCxxBridgedType(p.type)
    return `${p.name}: ${bridgedType.parseFromCppToSwift(p.name, 'swift')}`
  })
  let body: string
  if (returnType.hasType) {
    body = `
let __result = try __instance.${method.name}(${passParams.join(', ')})
let __resultCpp = ${returnType.parseFromSwiftToCpp('__result', 'swift')}
return bridge.${resultBridge.funcName}(__resultCpp)
`.trim()
  } else {
    body = `
try __instance.${method.name}(${passParams.join(', ')})
return bridge.${resultBridge.funcName}()
`.trim()
  }

  return `
@inline(__always)
public static func ${method.name}(${params.join(', ')}) -> ${bridgedResultType.getTypeCode('swift')} {
  do {
    let __instance = cast(this)
    ${indent(body, '    ')}
  } catch (let __error) {
    let __exceptionPtr = ${indent(bridgedErrorType.parseFromSwiftToCpp('__error', 'swift'), '    ')}
    return bridge.${resultBridge.funcName}(__exceptionPtr)
  }
}
  `.trim()
}
