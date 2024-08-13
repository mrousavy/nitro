import type { SourceImport } from '../SourceFile.js'
import type { ArrayType } from '../types/ArrayType.js'
import type { OptionalType } from '../types/OptionalType.js'
import type { RecordType } from '../types/RecordType.js'

interface SwiftCxxHelper {
  cxxCode: string
  funcName: string
  requiredInclude: SourceImport
}

/**
 * Creates a C++ `makeOptional<T>(value)` function that can be called from Swift.
 */
export function createCxxOptionalSwiftHelper(
  type: OptionalType
): SwiftCxxHelper {
  const actualType = type.wrappingType.getCode('c++')
  return {
    funcName: 'makeOptional',
    requiredInclude: {
      name: 'optional',
      space: 'system',
      language: 'c++',
    },
    cxxCode: `
inline std::optional<${actualType}> makeOptional(const ${actualType}& value) {
  return std::optional<${actualType}>(value);
}
    `,
  }
}

/**
 * Creates a C++ `makeVector<T>(size)` function that can be called from Swift.
 */
export function createCxxVectorSwiftHelper(type: ArrayType): SwiftCxxHelper {
  const actualType = type.itemType.getCode('c++')
  return {
    funcName: 'makeVector',
    requiredInclude: {
      name: 'vector',
      space: 'system',
      language: 'c++',
    },
    cxxCode: `
inline std::vector<${actualType}> makeVector(size_t size) {
  std::vector<${actualType}> vector;
  vector.reserve(size);
  return vector;
}
    `,
  }
}

/**
 * Creates a C++ `makeUnorderedMap<T>(size)` function that can be called from Swift.
 */
export function createCxxUnorderedMapSwiftHelper(
  type: RecordType
): SwiftCxxHelper {
  const keyType = type.keyType.getCode('c++')
  const valueType = type.valueType.getCode('c++')
  return {
    funcName: 'makeUnorderedMap',
    requiredInclude: {
      name: 'unordered_map',
      space: 'system',
      language: 'c++',
    },
    cxxCode: `
inline std::unordered_map<${keyType}, ${valueType}> makeUnorderedMap(size_t size) {
  std::unordered_map<${keyType}, ${valueType}> map;
  map.reserve(size);
  return map;
}
    `,
  }
}
