import { escapeCppName, toReferenceType } from '../helpers.js'
import type { SourceImport } from '../SourceFile.js'
import { FunctionType } from '../types/FunctionType.js'
import { getTypeAs } from '../types/getTypeAs.js'
import type { Type } from '../types/Type.js'
import { escapeComments, indent } from '../../utils.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'
import { HybridObjectType } from '../types/HybridObjectType.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import { getUmbrellaHeaderName } from '../../autolinking/ios/createSwiftUmbrellaHeader.js'

export interface SwiftCxxHelper {
  cxxHeader: {
    code: string
    requiredIncludes: SourceImport[]
  }
  cxxImplementation?: {
    code: string
    requiredIncludes: SourceImport[]
  }
  funcName: string
  specializationName: string
  cxxType: string
  dependencies: SwiftCxxHelper[]
}

export function createSwiftCxxHelpers(type: Type): SwiftCxxHelper | undefined {
  switch (type.kind) {
    case 'hybrid-object':
      return createCxxHybridObjectSwiftHelper(getTypeAs(type, HybridObjectType))
    case 'function':
      return createCxxFunctionSwiftHelper(getTypeAs(type, FunctionType))
    default:
      return undefined
  }
}

/**
 * Creates a C++ `create_HybridTSpecSwift(value)` function that can be called from Swift.
 */
function createCxxHybridObjectSwiftHelper(
  type: HybridObjectType
): SwiftCxxHelper {
  const actualType = type.getCode('c++')
  const modulename = type.sourceConfig.getIosModuleName()
  const { HybridTSpecCxx, HybridTSpecSwift, HybridTSpec } = getHybridObjectName(
    type.hybridObjectName
  )
  const swiftWrappingType = type.sourceConfig.getCxxNamespace(
    'c++',
    HybridTSpecSwift
  )
  const swiftPartType = `${modulename}::${HybridTSpecCxx}`
  const name = escapeCppName(actualType)

  const upcastHelpers = type.baseTypes.map((base) =>
    createCxxUpcastHelper(base, type)
  )

  const includes: SourceImport[] = []
  if (!type.sourceConfig.isExternalConfig) {
    // we are including our Swift helper internally. this is a private header so we can include just fine.
    includes.push({
      language: 'c++',
      // Hybrid Object Swift C++ class wrapper
      name: `${HybridTSpecSwift}.hpp`,
      space: 'user',
    })
  } else {
    // it's an external type - we need to include the external module's bridge as the *Swift.hpp header is private.
    const externalBridgeName = type.sourceConfig.getSwiftBridgeHeaderName()
    const moduleName = type.sourceConfig.getIosModuleName()
    includes.push({
      language: 'c++',
      name: `${moduleName}/${externalBridgeName}.hpp`,
      space: 'system',
    })
  }

  let getImplementation: string
  let createImplementation: string
  if (!type.sourceConfig.isExternalConfig) {
    // We own the implementation - we call into Swift to convert it internally
    createImplementation = `
${swiftPartType} swiftPart = ${swiftPartType}::fromUnsafe(swiftUnsafePointer);
return std::make_shared<${swiftWrappingType}>(swiftPart);
    `.trim()
    getImplementation = `
std::shared_ptr<${swiftWrappingType}> swiftWrapper = std::dynamic_pointer_cast<${swiftWrappingType}>(cppType);
#ifdef NITRO_DEBUG
if (swiftWrapper == nullptr) [[unlikely]] {
  throw std::runtime_error("Class \\"${HybridTSpec}\\" is not implemented in Swift!");
}
#endif
${swiftPartType}& swiftPart = swiftWrapper->getSwiftPart();
return swiftPart.toUnsafe();
`.trim()
  } else {
    // It's an external type - we have to delegate the call to the external library's functions
    const cxxNamespace = type.sourceConfig.getSwiftBridgeNamespace('c++')
    const internalType = type.getCode('c++', { fullyQualified: false })
    const internalName = escapeCppName(internalType)
    createImplementation = `
// Implemented in ${type.sourceConfig.getIosModuleName()}
return ${cxxNamespace}::create_${internalName}(swiftUnsafePointer);
`.trim()
    getImplementation = `
// Implemented in ${type.sourceConfig.getIosModuleName()}
return ${cxxNamespace}::get_${internalName}(cppType);
`.trim()
  }

  return {
    cxxType: actualType,
    funcName: `create_${name}`,
    specializationName: name,
    cxxHeader: {
      code: `
/**
 * Specialized version of \`${escapeComments(actualType)}\`.
 */
using ${name} = ${actualType};
${actualType} create_${name}(void* NON_NULL swiftUnsafePointer) noexcept;
void* NON_NULL get_${name}(${name} cppType);
    `.trim(),
      requiredIncludes: type.getRequiredImports('c++'),
    },
    cxxImplementation: {
      code: `
${actualType} create_${name}(void* NON_NULL swiftUnsafePointer) noexcept {
  ${indent(createImplementation, '  ')}
}
void* NON_NULL get_${name}(${name} cppType) {
  ${indent(getImplementation, '  ')}
}
    `.trim(),
      requiredIncludes: [
        ...includes,
        {
          language: 'c++',
          name: 'NitroModules/NitroDefines.hpp',
          space: 'system',
        },
        {
          language: 'c++',
          // Swift umbrella header
          name: getUmbrellaHeaderName(),
          space: 'user',
        },
      ],
    },
    dependencies: [...upcastHelpers, createCxxWeakPtrHelper(type)],
  }
}

function createCxxUpcastHelper(
  baseType: HybridObjectType,
  childType: HybridObjectType
): SwiftCxxHelper {
  const cppBaseType = baseType.getCode('c++')
  const cppChildType = childType.getCode('c++')
  const funcName = escapeCppName(
    `upcast_${childType.hybridObjectName}_to_${baseType.hybridObjectName}`
  )
  return {
    cxxType: cppBaseType,
    funcName: funcName,
    specializationName: funcName,
    cxxHeader: {
      code: `
inline ${cppBaseType} ${funcName}(${cppChildType} child) noexcept { return child; }
`.trim(),
      requiredIncludes: [],
    },
    dependencies: [],
  }
}

function createCxxWeakPtrHelper(type: HybridObjectType): SwiftCxxHelper {
  const actualType = type.getCode('c++', { mode: 'weak' })
  const specializationName = escapeCppName(actualType)
  const funcName = `weakify_${escapeCppName(type.getCode('c++'))}`
  const parameterType = type.getCode('c++', { mode: 'strong' })
  return {
    cxxType: actualType,
    funcName: funcName,
    specializationName: specializationName,
    cxxHeader: {
      code: `
using ${specializationName} = ${actualType};
inline ${specializationName} ${funcName}(const ${parameterType}& strong) noexcept { return strong; }
`.trim(),
      requiredIncludes: [],
    },
    dependencies: [],
  }
}

/**
 * Creates a C++ `Func_XXXXX` specialization that can be used from Swift.
 */
function createCxxFunctionSwiftHelper(type: FunctionType): SwiftCxxHelper {
  const actualType = type.getCode('c++')
  const bridgedType = new SwiftCxxBridgedType(type)
  const returnBridge = new SwiftCxxBridgedType(type.returnType)
  const paramsSignature = type.parameters.map((p) => {
    if (p.canBePassedByReference) {
      return `${toReferenceType(p.getCode('c++'))} ${p.escapedName}`
    } else {
      return `${p.getCode('c++')} ${p.escapedName}`
    }
  })
  const paramsForward = type.parameters.map((p) => {
    const bridge = new SwiftCxxBridgedType(p)
    return bridge.parseFromCppToSwift(p.escapedName, 'c++')
  })
  const name = type.specializationName
  const wrapperName = `${name}_Wrapper`
  const swiftClassName = `${NitroConfig.current.getIosModuleName()}::${type.specializationName}`

  const callParamsForward = type.parameters.map((p) => {
    const bridge = new SwiftCxxBridgedType(p)
    return bridge.parseFromSwiftToCpp(p.escapedName, 'c++')
  })

  const callFuncReturnType = returnBridge.getTypeCode('c++')
  const callCppFuncParamsSignature = type.parameters.map((p) => {
    const bridge = new SwiftCxxBridgedType(p)
    const cppType = bridge.getTypeCode('c++')
    return `${cppType} ${p.escapedName}`
  })
  let callCppFuncBody: string
  if (returnBridge.hasType) {
    callCppFuncBody = `
auto __result = _function->operator()(${callParamsForward.join(', ')});
return ${returnBridge.parseFromCppToSwift('__result', 'c++')};
    `.trim()
  } else {
    callCppFuncBody = `_function->operator()(${callParamsForward.join(', ')});`
  }

  let body: string
  if (type.returnType.kind === 'void') {
    body = `
swiftClosure.call(${paramsForward.join(', ')});
`.trim()
  } else {
    body = `
auto __result = swiftClosure.call(${paramsForward.join(', ')});
return ${returnBridge.parseFromSwiftToCpp('__result', 'c++')};
    `.trim()
  }

  // TODO: Remove our std::function wrapper once https://github.com/swiftlang/swift/issues/75844 is fixed.
  return {
    cxxType: actualType,
    funcName: `create_${name}`,
    specializationName: name,
    cxxHeader: {
      code: `
/**
 * Specialized version of \`${type.getCode('c++', { includeNameInfo: false })}\`.
 */
using ${name} = ${actualType};
/**
 * Wrapper class for a \`${escapeComments(actualType)}\`, this can be used from Swift.
 */
class ${wrapperName} final {
public:
  explicit ${wrapperName}(${actualType}&& func): _function(std::make_unique<${actualType}>(std::move(func))) {}
  inline ${callFuncReturnType} call(${callCppFuncParamsSignature.join(', ')}) const noexcept {
    ${indent(callCppFuncBody, '    ')}
  }
private:
  std::unique_ptr<${actualType}> _function;
} SWIFT_NONCOPYABLE;
${name} create_${name}(void* NON_NULL swiftClosureWrapper) noexcept;
inline ${wrapperName} wrap_${name}(${name} value) noexcept {
  return ${wrapperName}(std::move(value));
}
    `.trim(),
      requiredIncludes: [
        {
          name: 'functional',
          space: 'system',
          language: 'c++',
        },
        {
          name: 'memory',
          space: 'system',
          language: 'c++',
        },
        ...bridgedType.getRequiredImports('c++'),
      ],
    },
    cxxImplementation: {
      code: `
${name} create_${name}(void* NON_NULL swiftClosureWrapper) noexcept {
  auto swiftClosure = ${swiftClassName}::fromUnsafe(swiftClosureWrapper);
  return [swiftClosure = std::move(swiftClosure)](${paramsSignature.join(', ')}) mutable -> ${type.returnType.getCode('c++')} {
    ${indent(body, '    ')}
  };
}
`.trim(),
      requiredIncludes: [
        {
          language: 'c++',
          // Swift umbrella header
          name: getUmbrellaHeaderName(),
          space: 'user',
        },
      ],
    },
    dependencies: [],
  }
}
