import type { ts, Type } from 'ts-morph'
import type { NamedType } from './types/Type.js'
import { createNamedType } from './createType.js'

export function getInterfaceProperties(
  interfaceType: Type<ts.InterfaceType>
): NamedType[] {
  return interfaceType.getProperties().map((prop) => {
    const declaration = prop.getValueDeclarationOrThrow()
    const propType = prop.getTypeAtLocation(declaration)
    const refType = createNamedType(
      prop.getName(),
      propType,
      prop.isOptional() || propType.isNullable()
    )
    return refType
  })
}
