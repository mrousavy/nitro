import type { SourceFile } from "../SourceFile.js";
import {
  createRustFileMetadataString,
  isNotDuplicate,
  toSnakeCase,
} from "../helpers.js";
import type { NamedType } from "../types/Type.js";

/**
 * Creates a Rust struct definition from a Nitro StructType's properties.
 *
 * Structs are passed across the FFI boundary as opaque `void*` pointers
 * (boxed/unboxed), so `#[repr(C)]` is not needed and would be incorrect
 * for fields containing non-C-compatible types like String, Vec, etc.
 */
export function createRustStruct(
  structName: string,
  properties: NamedType[],
): SourceFile {
  // Collect use imports from field types
  const rustImports = properties
    .flatMap((p) => p.getRequiredImports("rust"))
    .filter((i) => i.language === "rust")
    .filter((i) => !i.name.endsWith(`::${structName}`))
    .map((i) => `use ${i.name};`)
    .filter(isNotDuplicate);
  const importsBlock =
    rustImports.length > 0 ? "\n" + rustImports.join("\n") + "\n" : "";

  const fields = properties
    .map((p) => {
      const rustFieldName = toSnakeCase(p.name);
      const rustType = p.getCode("rust");
      return `pub ${rustFieldName}: ${rustType},`;
    })
    .join("\n    ");

  const moduleName = toSnakeCase(structName);

  const code = `
${createRustFileMetadataString(`${moduleName}.rs`)}
${importsBlock}
/// Struct \`${structName}\` — auto-generated from TypeScript.
#[derive(Debug, Clone, PartialEq)]
pub struct ${structName} {
    ${fields}
}
`.trim();

  return {
    content: code,
    name: `${moduleName}.rs`,
    subdirectory: [],
    language: "rust",
    platform: "shared",
  };
}
