import { escapeCppName, toReferenceType } from '../helpers.js'
import type { SourceImport } from '../SourceFile.js'
import { VariantType } from '../types/VariantType.js'
import { ArrayType } from '../types/ArrayType.js'
import { FunctionType } from '../types/FunctionType.js'
import { getTypeAs } from '../types/getTypeAs.js'
import { OptionalType } from '../types/OptionalType.js'
import { RecordType } from '../types/RecordType.js'
import type { NamedType, Type } from '../types/Type.js'
import { TupleType } from '../types/TupleType.js'
import { escapeComments, indent } from '../../utils.js'
import { PromiseType } from '../types/PromiseType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'
import { HybridObjectType } from '../types/HybridObjectType.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { NitroConfig } from '../../config/NitroConfig.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import { getUmbrellaHeaderName } from '../../autolinking/ios/createSwiftUmbrellaHeader.js'
import { VoidType } from '../types/VoidType.js'
import { NamedWrappingType } from '../types/NamedWrappingType.js'
import { ErrorType } from '../types/ErrorType.js'

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
    case 'optional':
      return createCxxOptionalSwiftHelper(getTypeAs(type, OptionalType))
    case 'array':
      return createCxxVectorSwiftHelper(getTypeAs(type, ArrayType))
    case 'record':
      return createCxxUnorderedMapSwiftHelper(getTypeAs(type, RecordType))
    case 'function':
      return createCxxCallbackSwiftHelper(getTypeAs(type, FunctionType))
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
 * Creates a C++ `create_HybridTSpecSwift(value)` function that can be called from Swift.
 */
function createCxxHybridObjectSwiftHelper(
  type: HybridObjectType
): SwiftCxxHelper {
  const actualType = type.getCode('c++')
  const modulename = NitroConfig.getIosModuleName()
  const { HybridTSpecCxx, HybridTSpecSwift, HybridTSpec } = getHybridObjectName(
    type.hybridObjectName
  )
  const swiftWrappingType = NitroConfig.getCxxNamespace('c++', HybridTSpecSwift)
  const swiftPartType = `${modulename}::${HybridTSpecCxx}`
  const name = escapeCppName(actualType)
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
${actualType} create_${name}(void* _Nonnull swiftUnsafePointer);
void* _Nonnull get_${name}(${name} cppType);
    `.trim(),
      requiredIncludes: type.getRequiredImports(),
    },
    cxxImplementation: {
      code: `
${actualType} create_${name}(void* _Nonnull swiftUnsafePointer) {
  ${swiftPartType} swiftPart = ${swiftPartType}Unsafe::fromUnsafe(swiftUnsafePointer);
  return HybridContext::getOrCreate<${swiftWrappingType}>(swiftPart);
}
void* _Nonnull get_${name}(${name} cppType) {
  std::shared_ptr<${swiftWrappingType}> swiftWrapper = std::dynamic_pointer_cast<${swiftWrappingType}>(cppType);
#ifdef NITRO_DEBUG
  if (swiftWrapper == nullptr) [[unlikely]] {
    throw std::runtime_error("Class \\"${HybridTSpec}\\" is not implemented in Swift!");
  }
#endif
  ${swiftPartType} swiftPart = swiftWrapper->getSwiftPart();
  return ${swiftPartType}Unsafe::toUnsafe(swiftPart);
}
    `.trim(),
      requiredIncludes: [
        {
          language: 'c++',
          name: 'NitroModules/HybridContext.hpp',
          space: 'system',
          forwardDeclaration: getForwardDeclaration(
            'class',
            'HybridContext',
            'margelo::nitro'
          ),
        },
        {
          language: 'c++',
          // Hybrid Object Swift C++ class wrapper
          name: `${HybridTSpecSwift}.hpp`,
          space: 'user',
        },
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

/**
 * Creates a C++ `create_optional<T>(value)` function that can be called from Swift.
 */
function createCxxOptionalSwiftHelper(type: OptionalType): SwiftCxxHelper {
  const actualType = type.getCode('c++')
  const wrappedBridge = new SwiftCxxBridgedType(type.wrappingType, true)
  const name = escapeCppName(actualType)
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
inline ${actualType} create_${name}(const ${wrappedBridge.getTypeCode('c++')}& value) {
  return ${actualType}(${indent(wrappedBridge.parseFromSwiftToCpp('value', 'c++'), '    ')});
}
    `.trim(),
      requiredIncludes: [
        {
          name: 'optional',
          space: 'system',
          language: 'c++',
        },
        ...wrappedBridge.getRequiredImports(),
      ],
    },
    dependencies: [],
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
    cxxHeader: {
      code: `
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
      requiredIncludes: [
        {
          name: 'vector',
          space: 'system',
          language: 'c++',
        },
        ...bridgedType.getRequiredImports(),
      ],
    },
    dependencies: [],
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
    cxxHeader: {
      code: `
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
      requiredIncludes: [
        {
          name: 'unordered_map',
          space: 'system',
          language: 'c++',
        },
        ...bridgedType.getRequiredImports(),
      ],
    },
    dependencies: [],
  }
}

/**
 * Creates a C++ `Callback_XXXXX` specialization that can be used from Swift. (Callback)
 */
function createCxxCallbackSwiftHelper(type: FunctionType): SwiftCxxHelper {
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
  const paramsForward = [
    '_closureHolder.get()',
    ...type.parameters.map((p) => {
      const bridge = new SwiftCxxBridgedType(p)
      return bridge.parseFromCppToSwift(p.escapedName, 'c++')
    }),
  ]
  const callFuncReturnType = returnBridge.getTypeCode('c++')
  const callFuncParams = [
    'void* _Nonnull /* closureHolder */',
    ...type.parameters.map((p) => {
      const bridge = new SwiftCxxBridgedType(p)
      return bridge.getTypeCode('c++')
    }),
  ]
  const name = type.specializationName

  let callSwiftFuncBody: string
  if (returnBridge.hasType) {
    callSwiftFuncBody = `
auto __result = _callFunc(${paramsForward.join(', ')});
return ${returnBridge.parseFromSwiftToCpp('__result', 'c++')};
    `.trim()
  } else {
    callSwiftFuncBody = `_callFunc(${paramsForward.join(', ')});`
  }

  return {
    cxxType: actualType,
    funcName: `Swift${name}.init`,
    specializationName: name,
    cxxHeader: {
      code: `
/**
 * Specialized version of \`${type.getCode('c++', false)}\`.
 */
using ${name} = ${actualType};
class Swift${name}: public ${actualType} {
public:
  Swift${name}(void* _Nonnull closureHolder, ${callFuncReturnType}(* _Nonnull call)(${callFuncParams.join(', ')}), void(* _Nonnull destroy)(void* _Nonnull)) {
    _callFunc = call;
    _closureHolder = std::shared_ptr<void>(closureHolder, destroy);
  }
  ${type.returnType.getCode('c++')} callSync(${paramsSignature.join(', ')}) const override {
    ${indent(callSwiftFuncBody, '    ')}
  }
  std::function<${type.returnType.getCode('c++')}(${paramsSignature.join(', ')})> toFunction() const {
    return [_closureHolder = _closureHolder, _callFunc = _callFunc](${paramsSignature.join(', ')}) -> ${type.returnType.getCode('c++')} {
      return ${indent(callSwiftFuncBody, '    ')}
    };
  }

private:
  std::shared_ptr<void> _closureHolder;
  ${callFuncReturnType}(* _Nonnull _callFunc)(${callFuncParams.join(', ')});
};
    `.trim(),
      requiredIncludes: [
        {
          name: 'memory',
          space: 'system',
          language: 'c++',
        },
        ...bridgedType.getRequiredImports(),
      ],
    },
    dependencies: [],
  }
}

/**
 * Creates multiple C++ `create_variant_A_B_C<A, B, C>(A...)` functions that can be called from Swift.
 */
function createCxxVariantSwiftHelper(type: VariantType): SwiftCxxHelper {
  const actualType = type.getCode('c++')
  const bridgedType = new SwiftCxxBridgedType(type)
  const name = escapeCppName(actualType)
  const createFunctions = type.variants.map((t) => {
    const param = t.canBePassedByReference
      ? toReferenceType(t.getCode('c++'))
      : t.getCode('c++')

    return `
inline ${name} create_${name}(${param} value) {
  return ${name}(value);
}
      `.trim()
  })
  const getFunctions = type.variants.map((t, i) => {
    return `
inline ${t.getCode('c++')} get_${name}_${i}(const ${name}& variantWrapper) {
  return std::get<${i}>(variantWrapper.variant);
}`.trim()
  })
  return {
    cxxType: actualType,
    funcName: `create_${name}`,
    specializationName: name,
    cxxHeader: {
      code: `
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
${createFunctions.join('\n')}
${getFunctions.join('\n')}
        `.trim(),

      requiredIncludes: [
        {
          name: 'variant',
          space: 'system',
          language: 'c++',
        },
        ...bridgedType.getRequiredImports(),
      ],
    },
    dependencies: [],
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
    cxxHeader: {
      code: `
/**
 * Specialized version of \`${escapeComments(actualType)}\`.
 */
using ${name} = ${actualType};
inline ${actualType} create_${name}(${typesSignature}) {
  return ${actualType} { ${typesForward} };
}
     `.trim(),
      requiredIncludes: [
        {
          name: 'tuple',
          space: 'system',
          language: 'c++',
        },
        ...bridgedType.getRequiredImports(),
      ],
    },
    dependencies: [],
  }
}

/**
 * Creates a C++ `create_promise_T()` function that can be called from Swift to create a `std::shared_ptr<Promise<T>>`.
 */
function createCxxPromiseSwiftHelper(type: PromiseType): SwiftCxxHelper {
  const resultingType = type.resultingType.getCode('c++')
  const bridgedType = new SwiftCxxBridgedType(type)
  const actualType = `std::shared_ptr<Promise<${resultingType}>>`

  const resolverArgs: NamedType[] = []
  if (type.resultingType.kind !== 'void') {
    resolverArgs.push(new NamedWrappingType('result', type.resultingType))
  }
  const resolveFunction = new FunctionType(new VoidType(), resolverArgs)
  const rejectFunction = new FunctionType(new VoidType(), [
    new NamedWrappingType('error', new ErrorType()),
  ])

  const name = escapeCppName(actualType)
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
inline ${actualType} create_${name}() {
  return Promise<${resultingType}>::create();
}
       `.trim(),
      requiredIncludes: [
        {
          name: 'NitroModules/Promise.hpp',
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
    },
    dependencies: [
      createCxxCallbackSwiftHelper(resolveFunction),
      createCxxCallbackSwiftHelper(rejectFunction),
    ],
  }
}
