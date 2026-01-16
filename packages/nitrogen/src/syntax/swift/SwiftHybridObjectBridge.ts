import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'
import type { Property } from '../Property.js'
import { indent } from '../../utils.js'
import type { Method } from '../Method.js'
import {
  createFileMetadataString,
  escapeCppName,
  isNotDuplicate,
} from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import { includeHeader } from '../c++/includeNitroHeader.js'
import { getUmbrellaHeaderName } from '../../autolinking/ios/createSwiftUmbrellaHeader.js'
import { HybridObjectType } from '../types/HybridObjectType.js'

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
  const moduleName = spec.config.getIosModuleName()
  const bridgeNamespace = spec.config.getSwiftBridgeNamespace('swift')

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
public final func getView() -> UnsafeMutableRawPointer {
  return Unmanaged.passRetained(__implementation.view).toOpaque()
}
`.trim(),
      `
public final func beforeUpdate() {
  __implementation.beforeUpdate()
}
  `.trim(),
      `
public final func afterUpdate() {
  __implementation.afterUpdate()
}
`.trim(),
      `
public final func maybePrepareForRecycle() {
  guard let recyclable = __implementation as? RecyclableView else { return }
  recyclable.prepareForRecycle()
}
`.trim()
    )
  }

  const hybridObject = new HybridObjectType(spec)
  const bridgedType = new SwiftCxxBridgedType(hybridObject)
  const bridge = bridgedType.getRequiredBridge()
  if (bridge == null) throw new Error(`HybridObject Type should have a bridge!`)

  const weakifyBridge = bridge.dependencies.find((d) =>
    d.funcName.startsWith('weakify')
  )
  if (weakifyBridge == null)
    throw new Error(
      `HybridObject ${spec.name} does not have a weakify_..() bridge!`
    )

  const cppWeakPtrName = escapeCppName(
    hybridObject.getCode('c++', { mode: 'weak' })
  )

  const baseGetCxxPartOverrides = spec.baseTypes.map((base) => {
    const baseHybridObject = new HybridObjectType(base)
    const bridgedBase = new SwiftCxxBridgedType(baseHybridObject)
    const baseBridge = bridgedBase.getRequiredBridge()
    if (baseBridge == null)
      throw new Error(`HybridObject ${base.name}'s bridge cannot be null!`)

    const upcastBridge = bridge.dependencies.find(
      (b) =>
        b.funcName.includes(escapeCppName(spec.name)) &&
        b.funcName.includes(escapeCppName(base.name))
    )
    if (upcastBridge == null)
      throw new Error(
        `HybridObject ${spec.name}'s upcast-bridge cannot be found! ${JSON.stringify(baseBridge)}`
      )

    return `
public override func getCxxPart() -> bridge.${baseBridge.specializationName} {
  let ownCxxPart: bridge.${bridge.specializationName} = getCxxPart()
  return bridge.${upcastBridge.funcName}(ownCxxPart)
}`.trim()
  })

  const requiredImports = ['import NitroModules']
  requiredImports.push(
    ...spec.properties
      .flatMap((p) => p.getRequiredImports('swift'))
      .map((i) => `import ${i.name}`)
  )
  requiredImports.push(
    ...spec.methods.flatMap((m) =>
      m.getRequiredImports('swift').map((i) => `import ${i.name}`)
    )
  )
  const imports = requiredImports.filter(isNotDuplicate)

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
${hasBase ? `open class ${name.HybridTSpecCxx} : ${baseClasses.join(', ')}` : `open class ${name.HybridTSpecCxx}`} {
  /**
   * The Swift <> C++ bridge's namespace (\`${NitroConfig.current.getSwiftBridgeNamespace('c++')}\`)
   * from \`${moduleName}-Swift-Cxx-Bridge.hpp\`.
   * This contains specialized C++ templates, and C++ helper functions that can be accessed from Swift.
   */
  public typealias bridge = ${bridgeNamespace}

  /**
   * Holds an instance of the \`${name.HybridTSpec}\` Swift protocol.
   */
  private var __implementation: any ${name.HybridTSpec}

  /**
   * Holds a weak pointer to the C++ class that wraps the Swift class.
   */
  private var __cxxPart: bridge.${cppWeakPtrName}

  /**
   * Create a new \`${name.HybridTSpecCxx}\` that wraps the given \`${name.HybridTSpec}\`.
   * All properties and methods bridge to C++ types.
   */
  public init(_ implementation: any ${name.HybridTSpec}) {
    self.__implementation = implementation
    self.__cxxPart = .init()
    ${hasBase ? 'super.init(implementation)' : '/* no base class */'}
  }

  /**
   * Get the actual \`${name.HybridTSpec}\` instance this class wraps.
   */
  @inline(__always)
  public func get${name.HybridTSpec}() -> any ${name.HybridTSpec} {
    return __implementation
  }

  /**
   * Casts this instance to a retained unsafe raw pointer.
   * This acquires one additional strong reference on the object!
   */
  public ${hasBase ? 'override func' : 'func'} toUnsafe() -> UnsafeMutableRawPointer {
    return Unmanaged.passRetained(self).toOpaque()
  }

  /**
   * Casts an unsafe pointer to a \`${name.HybridTSpecCxx}\`.
   * The pointer has to be a retained opaque \`Unmanaged<${name.HybridTSpecCxx}>\`.
   * This removes one strong reference from the object!
   */
  public ${hasBase ? 'override class func' : 'class func'} fromUnsafe(_ pointer: UnsafeMutableRawPointer) -> ${name.HybridTSpecCxx} {
    return Unmanaged<${name.HybridTSpecCxx}>.fromOpaque(pointer).takeRetainedValue()
  }

  /**
   * Gets (or creates) the C++ part of this Hybrid Object.
   * The C++ part is a \`${bridge.cxxType}\`.
   */
  public func getCxxPart() -> bridge.${bridge.specializationName} {
    let cachedCxxPart = self.__cxxPart.lock()
    if Bool(fromCxx: cachedCxxPart) {
      return cachedCxxPart
    } else {
      let newCxxPart = bridge.${bridge.funcName}(self.toUnsafe())
      __cxxPart = bridge.${weakifyBridge.funcName}(newCxxPart)
      return newCxxPart
    }
  }

  ${indent(baseGetCxxPartOverrides.join('\n'), '  ')}

  /**
   * Get the memory size of the Swift class (plus size of any other allocations)
   * so the JS VM can properly track it and garbage-collect the JS object if needed.
   */
  @inline(__always)
  public ${hasBase ? 'override var' : 'var'} memorySize: Int {
    return MemoryHelper.getSizeOf(self.__implementation) + self.__implementation.memorySize
  }

  /**
   * Compares this object with the given [other] object for reference equality.
   */
  @inline(__always)
  public func equals(other: ${name.HybridTSpecCxx}) -> Bool {
    return self.__implementation === other.__implementation
  }

  /**
   * Call dispose() on the Swift class.
   * This _may_ be called manually from JS.
   */
  @inline(__always)
  public ${hasBase ? 'override func' : 'func'} dispose() {
    self.__implementation.dispose()
  }

  /**
   * Call toString() on the Swift class.
   */
  @inline(__always)
  public ${hasBase ? 'override func' : 'func'} toString() -> String {
    return self.__implementation.toString()
  }

  // Properties
  ${indent(propertiesBridge.join('\n\n'), '  ')}

  // Methods
  ${indent(methodsBridge.join('\n\n'), '  ')}
}
  `

  const cppPropertiesDeclarations = spec.properties
    .map((p) => p.getCode('c++', { override: true, noexcept: true }))
    .join('\n')
  const cppPropertiesImplementations = spec.properties
    .map((p) => {
      const bridged = new SwiftCxxBridgedType(p.type)
      let getter: string
      let setter: string

      const getterName = p.getGetterName('swift')
      const setterName = p.getSetterName('swift')
      if (bridged.needsSpecialHandling) {
        // we need custom C++ -> Swift conversion code
        getter = `
auto __result = _swiftPart->${getterName}();
return ${bridged.parseFromSwiftToCpp('__result', 'c++')};
`
        setter = `_swiftPart->${setterName}(${bridged.parseFromCppToSwift(p.name, 'c++')});`
      } else {
        // just forward value directly
        getter = `return _swiftPart->${getterName}();`
        setter = `_swiftPart->${setterName}(std::forward<decltype(${p.name})>(${p.name}));`
      }
      return p.getCode(
        'c++',
        {
          classDefinitionName: name.HybridTSpecSwift,
          noexcept: true,
        },
        {
          getter: getter.trim(),
          setter: setter.trim(),
        }
      )
    })
    .join('\n')

  const cppMethodsDeclarations = spec.methods
    .map((m) => m.getCode('c++', { override: true }))
    .join('\n')
  const cppMethodsImplementations = spec.methods
    .map((m) => {
      const params = m.parameters
        .map((p) => {
          const bridged = new SwiftCxxBridgedType(p.type)
          if (bridged.needsSpecialHandling) {
            // we need custom C++ -> Swift conversion code
            return bridged.parseFromCppToSwift(p.name, 'c++')
          } else {
            // just forward value directly
            return `std::forward<decltype(${p.name})>(${p.name})`
          }
        })
        .join(', ')
      const bridgedReturnType = new SwiftCxxBridgedType(m.returnType)
      const hasResult = m.returnType.kind !== 'void'
      let body: string
      if (hasResult) {
        // func returns something
        body = `
auto __result = _swiftPart->${m.name}(${params});
return ${bridgedReturnType.parseFromSwiftToCpp('__result', 'c++')};
        `.trim()
      } else {
        // void func
        body = `
_swiftPart->${m.name}(${params});
        `.trim()
      }

      return m.getCode(
        'c++',
        { classDefinitionName: name.HybridTSpecSwift },
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
  const cxxNamespace = spec.config.getCxxNamespace('c++')
  const iosModuleName = spec.config.getIosModuleName()
  const extraImports = allBridgedTypes.flatMap((b) =>
    b.getRequiredImports('c++')
  )

  const cppBaseClasses = [`public virtual ${name.HybridTSpec}`]
  const cppBaseCtorCalls = [`HybridObject(${name.HybridTSpec}::TAG)`]
  for (const base of spec.baseTypes) {
    const baseName = getHybridObjectName(base.name)
    cppBaseClasses.push(`public virtual ${baseName.HybridTSpecSwift}`)
    cppBaseCtorCalls.push(`${baseName.HybridTSpecSwift}(swiftPart)`)
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

${getForwardDeclaration('class', name.HybridTSpecCxx, iosModuleName)}

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
    explicit ${name.HybridTSpecSwift}(const ${iosModuleName}::${name.HybridTSpecCxx}& swiftPart);

  public:
    // Get the Swift part
    ${iosModuleName}::${name.HybridTSpecCxx}& getSwiftPart() noexcept;

  public:
    inline size_t getExternalMemorySize() noexcept override;
    bool equals(const std::shared_ptr<HybridObject>& other) override;
    void dispose() noexcept override;
    std::string toString() override;

  public:
    // Properties
    ${indent(cppPropertiesDeclarations, '    ')}

  public:
    // Methods
    ${indent(cppMethodsDeclarations, '    ')}

  private:
    std::shared_ptr<${iosModuleName}::${name.HybridTSpecCxx}> _swiftPart;
  };

} // namespace ${cxxNamespace}
  `
  const cppHybridObjectCodeCpp = `
${createFileMetadataString(`${name.HybridTSpecSwift}.cpp`)}

#include "${name.HybridTSpecSwift}.hpp"

#include "${getUmbrellaHeaderName()}"

namespace ${cxxNamespace} {

  // pragma MARK: Constructor

  ${name.HybridTSpecSwift}::${name.HybridTSpecSwift}(const ${iosModuleName}::${name.HybridTSpecCxx}& swiftPart):
    ${indent(cppBaseCtorCalls.join(',\n'), '    ')} {
    _swiftPart = std::make_shared<${iosModuleName}::${name.HybridTSpecCxx}>(swiftPart);
  }


  ${iosModuleName}::${name.HybridTSpecCxx}& ${name.HybridTSpecSwift}::getSwiftPart() noexcept {
    return *_swiftPart;
  }

  // pragma MARK: HybridObject overrides

  size_t ${name.HybridTSpecSwift}::getExternalMemorySize() noexcept {
    return _swiftPart->getMemorySize();
  }
  bool ${name.HybridTSpecSwift}::equals(const std::shared_ptr<HybridObject>& other) {
    if (auto otherCast = std::dynamic_pointer_cast<${name.HybridTSpecSwift}>(other)) {
      return _swiftPart->equals(otherCast->getSwiftPart());
    }
    return false;
  }
  void ${name.HybridTSpecSwift}::dispose() noexcept {
    _swiftPart->dispose();
  }
  std::string ${name.HybridTSpecSwift}::toString() {
    return _swiftPart->toString();
  }

  // pragma MARK: Properties

  ${indent(cppPropertiesImplementations, '  ')}

  // pragma MARK: Methods

  ${indent(cppMethodsImplementations, '  ')}

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
  const convertToCpp = bridgedType.parseFromSwiftToCpp(
    `self.__implementation.${property.name}`,
    'swift'
  )
  const convertFromCpp = bridgedType.parseFromCppToSwift('newValue', 'swift')
  const getter = `
@inline(__always)
get {
  return ${indent(convertToCpp, '  ')}
}
  `.trim()
  const setter = `
@inline(__always)
set {
  self.__implementation.${property.name} = ${indent(convertFromCpp, '  ')}
}
  `.trim()

  const body = [getter]
  if (!property.isReadonly) {
    body.push(setter)
  }

  const code = `
public final var ${property.name}: ${bridgedType.getTypeCode('swift')} {
  ${indent(body.join('\n'), '  ')}
}
  `
  return code.trim()
}

function getMethodForwardImplementation(method: Method): string {
  // wrapped return in a std::expected
  const returnType = new SwiftCxxBridgedType(method.returnType)
  const params = method.parameters.map((p) => {
    const bridgedType = new SwiftCxxBridgedType(p.type)
    return `${p.name}: ${bridgedType.getTypeCode('swift')}`
  })
  const passParams = method.parameters.map((p) => {
    const bridgedType = new SwiftCxxBridgedType(p.type)
    return `${p.name}: ${bridgedType.parseFromCppToSwift(p.name, 'swift')}`
  })
  let body: string
  if (returnType.hasType) {
    body = `
// TODO: Remove try!
let __result = try! self.__implementation.${method.name}(${passParams.join(', ')})
return ${returnType.parseFromSwiftToCpp('__result', 'swift')}
`.trim()
  } else {
    body = `
// TODO: Remove try!
try! self.__implementation.${method.name}(${passParams.join(', ')})
`.trim()
  }

  return `
@inline(__always)
public final func ${method.name}(${params.join(', ')}) -> ${returnType.getTypeCode('swift')} {
  ${indent(body, '  ')}
}
  `.trim()
}
