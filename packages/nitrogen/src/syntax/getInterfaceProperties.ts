import { ts, Type } from 'ts-morph'
import type { NamedType } from './types/Type.js'
import { createNamedType } from './createType.js'
import type { Language } from '../getPlatformSpecs.js'

export function getInterfaceProperties(
  language: Language,
  interfaceType: Type<ts.ObjectType>
): NamedType[] {
  return interfaceType.getProperties().map((prop) => {
    const declaration = prop.getValueDeclarationOrThrow()

    let propType = prop.getTypeAtLocation(declaration)

    if (
      prop.isOptional() &&
      (declaration.isKind(ts.SyntaxKind.PropertySignature) ||
      declaration.isKind(ts.SyntaxKind.PropertyDeclaration))
    ) {
      const typeNode = declaration.getTypeNode()
      
      if (typeNode != null) {
        propType = typeNode.getType()
      }
    }

    const refType = createNamedType(
      language,
      prop.getName(),
      propType,
      prop.isOptional() || propType.isNullable()
    )
    return refType
  })
}
