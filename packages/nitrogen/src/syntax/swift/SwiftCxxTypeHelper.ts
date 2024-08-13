import { escapeCppName } from '../helpers.js'
import type { SourceImport } from '../SourceFile.js'
import { ArrayType } from '../types/ArrayType.js'
import { getTypeAs } from '../types/getTypeAs.js'
import { OptionalType } from '../types/OptionalType.js'
import { RecordType } from '../types/RecordType.js'
import type { Type } from '../types/Type.js'

export interface SwiftCxxHelper {
  cxxCode: string
  funcName: string
  requiredIncludes: SourceImport[]
}

export function createSwiftCxxHelpers(type: Type): SwiftCxxHelper[] {
  switch (type.kind) {
    case 'optional':
      return createCxxOptionalSwiftHelper(getTypeAs(type, OptionalType))
    case 'array':
      return createCxxVectorSwiftHelper(getTypeAs(type, ArrayType))
    case 'record':
      return createCxxUnorderedMapSwiftHelper(getTypeAs(type, RecordType))
    default:
      return []
  }
}

/**
 * Creates a C++ `create_optional<T>(value)` function that can be called from Swift.
 */
export function createCxxOptionalSwiftHelper(
  type: OptionalType
): SwiftCxxHelper[] {
  const actualType = type.wrappingType.getCode('c++')
  const name = escapeCppName(type.getCode('c++'))
  return [
    {
      funcName: `create_${name}`,
      requiredIncludes: [
        {
          name: 'optional',
          space: 'system',
          language: 'c++',
        },
        ...type.getRequiredImports(),
      ],
      cxxCode: `
inline std::optional<${actualType}> create_${name}(const ${actualType}& value) {
  return std::optional<${actualType}>(value);
}
    `.trim(),
    },
  ]
}

/**
 * Creates a C++ `create_vector_T<T>(size)` function that can be called from Swift.
 */
export function createCxxVectorSwiftHelper(type: ArrayType): SwiftCxxHelper[] {
  const actualType = type.itemType.getCode('c++')
  const name = escapeCppName(type.getCode('c++'))
  return [
    {
      funcName: `create_${name}`,
      requiredIncludes: [
        {
          name: 'vector',
          space: 'system',
          language: 'c++',
        },
        ...type.getRequiredImports(),
      ],
      cxxCode: `
inline std::vector<${actualType}> create_${name}(size_t size) {
  std::vector<${actualType}> vector;
  vector.reserve(size);
  return vector;
}
    `.trim(),
    },
  ]
}

/**
 * Creates a C++ `makeUnorderedMap<T>(size)` function that can be called from Swift.
 */
export function createCxxUnorderedMapSwiftHelper(
  type: RecordType
): SwiftCxxHelper[] {
  const keyType = type.keyType.getCode('c++')
  const valueType = type.valueType.getCode('c++')
  const name = escapeCppName(type.getCode('c++'))
  return [
    {
      funcName: `create_${name}`,
      requiredIncludes: [
        {
          name: 'unordered_map',
          space: 'system',
          language: 'c++',
        },
        ...type.getRequiredImports(),
      ],
      cxxCode: `
inline std::unordered_map<${keyType}, ${valueType}> create_${name}(size_t size) {
  std::unordered_map<${keyType}, ${valueType}> map;
  map.reserve(size);
  return map;
}
    `.trim(),
    },
  ]
}
