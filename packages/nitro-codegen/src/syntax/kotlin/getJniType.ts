import { getHybridObjectName } from '../getHybridObjectName.js'
import { ArrayType } from '../types/ArrayType.js'
import { EnumType } from '../types/EnumType.js'
import { FunctionType } from '../types/FunctionType.js'
import { getTypeAs } from '../types/getTypeAs.js'
import { HybridObjectType } from '../types/HybridObjectType.js'
import { StructType } from '../types/StructType.js'
import type { Type } from '../types/Type.js'

export function getJniType(type: Type): string {
  switch (type.kind) {
    case 'array':
      const arrayType = getTypeAs(type, ArrayType)
      return `JCollection<${getJniType(arrayType.itemType)}>`
    case 'enum':
      const enumType = getTypeAs(type, EnumType)
      return `J${enumType.enumName}`
    case 'struct':
      const structType = getTypeAs(type, StructType)
      return `J${structType.structName}`
    case 'hybrid-object':
      const hybridObjectType = getTypeAs(type, HybridObjectType)
      const name = getHybridObjectName(hybridObjectType.hybridObjectName)
      return `jni::alias_ref<${name.JHybridT}::javaobject>`
    case 'function':
      const functionType = getTypeAs(type, FunctionType)
      return `jni::alias_ref<J${functionType.specialization.typename}::javaobject>`
    default:
      return type.getCode('c++')
  }
}
