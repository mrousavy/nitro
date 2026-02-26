import type { SourceFile } from "../SourceFile.js";
import { createRustFileMetadataString, isNotDuplicate, toSnakeCase } from "../helpers.js";
import type { VariantType } from "../types/VariantType.js";

/**
 * Creates a Rust enum (tagged union) from a Nitro VariantType.
 *
 * TypeScript `A | B | C` becomes Rust `enum Variant_A_B_C { First(A), Second(B), Third(C) }`.
 * Each case holds its associated data.
 */
export function createRustVariant(variant: VariantType): SourceFile {
  const aliasName = variant.getAliasName("rust");

  // Collect use imports from case types
  const rustImports = variant.variants
    .flatMap((v) => v.getRequiredImports("rust"))
    .filter((i) => i.language === "rust")
    .filter((i) => !i.name.endsWith(`::${aliasName}`))
    .map((i) => `use ${i.name};`)
    .filter(isNotDuplicate);
  const importsBlock =
    rustImports.length > 0 ? "\n" + rustImports.join("\n") + "\n" : "";

  const cases = variant.cases
    .map(([label, type]) => {
      const rustType = type.getCode("rust");
      const caseName = label.charAt(0).toUpperCase() + label.slice(1);
      return `${caseName}(${rustType}),`;
    })
    .join("\n    ");

  const moduleName = toSnakeCase(aliasName);

  const code = `
${createRustFileMetadataString(`${moduleName}.rs`)}
${importsBlock}
/// Tagged union \`${aliasName}\` — auto-generated from TypeScript.
#[derive(Debug, Clone, PartialEq)]
pub enum ${aliasName} {
    ${cases}
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
