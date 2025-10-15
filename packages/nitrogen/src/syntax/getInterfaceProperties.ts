import { ts, type Type } from 'ts-morph'
import type { NamedType } from './types/Type.js'
import { createNamedType } from './createType.js'
import type { Language } from '../getPlatformSpecs.js'

export function getInterfaceProperties(
  language: Language,
  interfaceType: Type<ts.ObjectType>
): NamedType[] {
  return interfaceType.getProperties().map((prop) => {
    const declaration = prop.getValueDeclarationOrThrow()

    if (!declaration.isKind(ts.SyntaxKind.PropertySignature)) {
      throw new Error(
        `Property "${prop.getName()}" has an unsupported declaration kind. Make sure it's declared as "propertyName: Type" in an interface or type declaration.`
      )
    }

    const typeNode = declaration.getTypeNode()

    if (typeNode == null) {
      throw new Error(
        `Property "${prop.getName()}" has no explicit type annotation. All properties in Nitro specs must have explicit type annotations.`
      )
    }

    const propType = typeNode.getType()

    const refType = createNamedType(
      language,
      prop.getName(),
      propType,
      prop.isOptional() || propType.isNullable()
    )
    return refType
  })
}
