import { escapeCppName, toReferenceType } from '../helpers.js'
import type { SourceImport } from '../SourceFile.js'
import { VariantType } from '../types/VariantType.js'
import { ArrayType } from '../types/ArrayType.js'
import { FunctionType } from '../types/FunctionType.js'
import { getTypeAs } from '../types/getTypeAs.js'
import { OptionalType } from '../types/OptionalType.js'
import { RecordType } from '../types/RecordType.js'
import type { Type } from '../types/Type.js'
import { TupleType } from '../types/TupleType.js'
import { escapeComments, indent } from '../../utils.js'
import { PromiseType } from '../types/PromiseType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

export interface SwiftCxxHelper {
  cxxCode: string
  funcName: string
  specializationName: string
  cxxType: string
  requiredIncludes: SourceImport[]
}

export function createSwiftCxxHelpers(type: Type): SwiftCxxHelper | undefined {
  switch (type.kind) {
    case 'optional':
      return createCxxOptionalSwiftHelper(getTypeAs(type, OptionalType))
    case 'array':
      return createCxxVectorSwiftHelper(getTypeAs(type, ArrayType))
    case 'record':
      return createCxxUnorderedMapSwiftHelper(getTypeAs(type, RecordType))
    case 'function':
      return createCxxFunctionSwiftHelper(getTypeAs(type, FunctionType))
    case 'variant':
      return createCxxVariantSwiftHelper(getTypeAs(type, VariantType))
    case 'tuple':
      return createCxxTupleSwiftHelper(getTypeAs(type, TupleType))
    case 'promise':
      return createCxxPromiseSwiftHelper(getTypeAs(type, PromiseType))
    default:
      return undefined
  }
}

/**
 * Creates a C++ `create_optional<T>(value)` function that can be called from Swift.
 */
function createCxxOptionalSwiftHelper(type: OptionalType): SwiftCxxHelper {
  const actualType = type.getCode('c++')
  const bridgedType = new SwiftCxxBridgedType(type)
  const name = escapeCppName(actualType)
  return {
    cxxType: actualType,
    funcName: `create_${name}`,
    specializationName: name,
    requiredIncludes: [
      {
        name: 'optional',
        space: 'system',
        language: 'c++',
      },
      ...bridgedType.getRequiredImports(),
    ],
    cxxCode: `
/**
 * Specialized version of \`${escapeComments(actualType)}\`.
 */
using ${name} = ${actualType};
inline ${actualType} create_${name}(const ${type.wrappingType.getCode('c++')}& value) {
  return ${actualType}(value);
}
    `.trim(),
  }
}

/**
 * Creates a C++ `create_vector_T<T>(size)` function that can be called from Swift.
 */
function createCxxVectorSwiftHelper(type: ArrayType): SwiftCxxHelper {
  const actualType = type.getCode('c++')
  const bridgedType = new SwiftCxxBridgedType(type)
  const name = escapeCppName(actualType)
  return {
    cxxType: actualType,
    funcName: `create_${name}`,
    specializationName: name,
    requiredIncludes: [
      {
        name: 'vector',
        space: 'system',
        language: 'c++',
      },
      ...bridgedType.getRequiredImports(),
    ],
    cxxCode: `
/**
 * Specialized version of \`${escapeComments(actualType)}\`.
 */
using ${name} = ${actualType};
inline ${actualType} create_${name}(size_t size) {
  ${actualType} vector;
  vector.reserve(size);
  return vector;
}
    `.trim(),
  }
}

/**
 * Creates a C++ `makeUnorderedMap<T>(size)` function that can be called from Swift.
 */
function createCxxUnorderedMapSwiftHelper(type: RecordType): SwiftCxxHelper {
  const actualType = type.getCode('c++')
  const bridgedType = new SwiftCxxBridgedType(type)
  const name = escapeCppName(actualType)
  const keyType = type.keyType.getCode('c++')
  return {
    cxxType: actualType,
    funcName: `create_${name}`,
    specializationName: name,
    requiredIncludes: [
      {
        name: 'unordered_map',
        space: 'system',
        language: 'c++',
      },
      ...bridgedType.getRequiredImports(),
    ],
    cxxCode: `
/**
 * Specialized version of \`${escapeComments(actualType)}\`.
 */
using ${name} = ${actualType};
inline ${actualType} create_${name}(size_t size) {
  ${actualType} map;
  map.reserve(size);
  return map;
}
inline std::vector<${keyType}> get_${name}_keys(const ${name}& map) {
  std::vector<${keyType}> keys;
  keys.reserve(map.size());
  for (const auto& entry : map) {
    keys.push_back(entry.first);
  }
  return keys;
}
    `.trim(),
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
  const callCppFuncParamsSignature = type.parameters.map((p) => {
    const bridge = new SwiftCxxBridgedType(p)
    const cppType = bridge.getTypeCode('c++')
    return `${cppType} ${p.escapedName}`
  })
  const callParamsForward = type.parameters.map((p) => {
    const bridge = new SwiftCxxBridgedType(p)
    return bridge.parseFromSwiftToCpp(p.escapedName, 'c++')
  })
  const paramsForward = [
    'sharedClosureHolder.get()',
    ...type.parameters.map((p) => {
      const bridge = new SwiftCxxBridgedType(p)
      return bridge.parseFromCppToSwift(p.escapedName, 'c++')
    }),
  ]
  const callFuncReturnType = returnBridge.getTypeCode('c++')
  const callFuncParams = [
    'void* /* closureHolder */',
    ...type.parameters.map((p) => {
      const bridge = new SwiftCxxBridgedType(p)
      return bridge.getTypeCode('c++')
    }),
  ]
  const functionPointerParam = `${callFuncReturnType}(*call)(${callFuncParams.join(', ')})`
  const name = type.specializationName
  const wrapperName = `${name}_Wrapper`

  let callCppFuncBody: string
  if (returnBridge.hasType) {
    callCppFuncBody = `
    auto result = function(${indent(callParamsForward.join(', '), '    ')});
    return ${indent(returnBridge.parseFromCppToSwift('result', 'c++'), '    ')};
    `.trim()
  } else {
    callCppFuncBody = `function(${indent(callParamsForward.join(', '), '    ')});`
  }

  let callSwiftFuncBody: string
  if (returnBridge.hasType) {
    callSwiftFuncBody = `
    auto result = call(${indent(paramsForward.join(', '), '    ')});
    return ${indent(returnBridge.parseFromSwiftToCpp('result', 'c++'), '    ')};
    `.trim()
  } else {
    callSwiftFuncBody = `call(${indent(paramsForward.join(', '), '    ')});`
  }

  // TODO: Remove shared_Func_void(...) function that returns a std::shared_ptr<std::function<...>>
  //       once Swift fixes the bug where a regular std::function cannot be captured.
  //       https://github.com/swiftlang/swift/issues/76143

  return {
    cxxType: actualType,
    funcName: `create_${name}`,
    specializationName: name,
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
      ...bridgedType.getRequiredImports(),
    ],
    cxxCode: `
/**
 * Specialized version of \`${type.getCode('c++', false)}\`.
 */
using ${name} = ${actualType};
/**
 * Wrapper class for a \`${escapeComments(actualType)}\`, this can be used from Swift.
 */
class ${wrapperName} {
public:
  explicit ${wrapperName}(const ${actualType}& func): function(func) {}
  explicit ${wrapperName}(${actualType}&& func): function(std::move(func)) {}

  ${callFuncReturnType} call(${callCppFuncParamsSignature.join(', ')}) const {
    ${callCppFuncBody}
  }

  ${actualType} function;
};
inline ${name} create_${name}(void* closureHolder, ${functionPointerParam}, void(*destroy)(void*)) {
  std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
  return ${name}([sharedClosureHolder, call](${paramsSignature.join(', ')}) -> ${type.returnType.getCode('c++')} {
    ${callSwiftFuncBody}
  });
}
inline std::shared_ptr<${wrapperName}> share_${name}(const ${name}& value) {
  return std::make_shared<${wrapperName}>(value);
}
    `.trim(),
  }
}

/**
 * Creates multiple C++ `create_variant_A_B_C<A, B, C>(A...)` functions that can be called from Swift.
 */
function createCxxVariantSwiftHelper(type: VariantType): SwiftCxxHelper {
  const actualType = type.getCode('c++')
  const bridgedType = new SwiftCxxBridgedType(type)
  const name = escapeCppName(actualType)
  const createFunctions = type.variants
    .map((t) => {
      const param = t.canBePassedByReference
        ? toReferenceType(t.getCode('c++'))
        : t.getCode('c++')
      return `
inline ${name} create_${name}(${param} value) {
  return ${name}(value);
}
      `.trim()
    })
    .join('\n')
  const getFunctions = type.variants
    .map((t, i) => {
      return `
inline ${t.getCode('c++')} get_${name}_${i}(const ${name}& variantWrapper) {
  return std::get<${i}>(variantWrapper.variant);
}
      `.trim()
    })
    .join('\n')
  return {
    cxxType: actualType,
    funcName: `create_${name}`,
    specializationName: name,
    requiredIncludes: [
      {
        name: 'variant',
        space: 'system',
        language: 'c++',
      },
      ...bridgedType.getRequiredImports(),
    ],
    cxxCode: `
/**
 * Wrapper struct for \`${escapeComments(actualType)}\`.
 * std::variant cannot be used in Swift because of a Swift bug.
 * Not even specializing it works. So we create a wrapper struct.
 */
struct ${name} {
  ${actualType} variant;
  ${name}(${actualType} variant): variant(variant) { }
  operator ${actualType}() const {
    return variant;
  }
  inline size_t index() const {
    return variant.index();
  }
};
${createFunctions}
${getFunctions}
      `.trim(),
  }
}

/**
 * Creates a C++ `create_tuple_A_B_C<A, B, C>(A, B, C)` function that can be called from Swift.
 */
function createCxxTupleSwiftHelper(type: TupleType): SwiftCxxHelper {
  const actualType = type.getCode('c++')
  const bridgedType = new SwiftCxxBridgedType(type)
  const name = escapeCppName(actualType)
  const typesSignature = type.itemTypes
    .map((t, i) => {
      const code = t.getCode('c++')
      return `${t.canBePassedByReference ? toReferenceType(code) : code} arg${i}`
    })
    .join(', ')
  const typesForward = type.itemTypes.map((_t, i) => `arg${i}`).join(', ')
  return {
    cxxType: actualType,
    funcName: `create_${name}`,
    specializationName: name,
    requiredIncludes: [
      {
        name: 'tuple',
        space: 'system',
        language: 'c++',
      },
      ...bridgedType.getRequiredImports(),
    ],
    cxxCode: `
/**
 * Specialized version of \`${escapeComments(actualType)}\`.
 */
using ${name} = ${actualType};
inline ${actualType} create_${name}(${typesSignature}) {
  return ${actualType} { ${typesForward} };
}
     `.trim(),
  }
}

/**
 * Creates a C++ `create_promise_T()` function that can be called from Swift to create a `PromiseHolder`.
 */
function createCxxPromiseSwiftHelper(type: PromiseType): SwiftCxxHelper {
  const resultingType = type.resultingType.getCode('c++')
  const bridgedType = new SwiftCxxBridgedType(type)
  const actualType = `PromiseHolder<${resultingType}>`
  const name = escapeCppName(actualType)
  return {
    cxxType: actualType,
    funcName: `create_${name}`,
    specializationName: name,
    requiredIncludes: [
      {
        name: 'NitroModules/PromiseHolder.hpp',
        space: 'system',
        language: 'c++',
      },
      ...bridgedType.getRequiredImports(),
    ],
    cxxCode: `
/**
 * Specialized version of \`${escapeComments(actualType)}\`.
 */
using ${name} = ${actualType};
inline ${actualType} create_${name}() {
  return ${actualType}();
}
     `.trim(),
  }
}
