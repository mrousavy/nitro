/**
 * Represents a custom, manually written native type.
 * - {@linkcode TypeName}: Represents the name of the C++ class.
 * - {@linkcode HeaderImport}: Represents the name of the C++ header that needs to be imported.
 */
export type CustomType<TypeName extends string, HeaderImport extends string> = {
  __typeName?: TypeName
  __headerImport?: HeaderImport
}
