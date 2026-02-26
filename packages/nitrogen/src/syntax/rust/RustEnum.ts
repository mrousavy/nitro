import type { SourceFile } from "../SourceFile.js";
import { createRustFileMetadataString } from "../helpers.js";
import type { EnumMember, EnumType } from "../types/EnumType.js";

/**
 * Creates a Rust enum definition from a Nitro EnumType.
 *
 * Generates a `#[repr(i32)]` Rust enum with explicit discriminant values
 * matching the C++ enum class, enabling safe transmute at the FFI boundary.
 */
export function createRustEnum(enumType: EnumType): SourceFile {
  const enumName = enumType.enumName;
  const members = enumType.enumMembers;

  const rustMembers = members
    .map((m) => `${toRustEnumMemberName(m)} = ${m.value},`)
    .join("\n    ");

  const fromI32Cases = members
    .map((m) => `${m.value} => Some(${enumName}::${toRustEnumMemberName(m)}),`)
    .join("\n            ");

  const code = `
${createRustFileMetadataString(`${enumName}.rs`)}

/// Enum \`${enumName}\` — auto-generated from TypeScript.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
#[repr(i32)]
pub enum ${enumName} {
    ${rustMembers}
}

impl ${enumName} {
    /// Convert from an i32 discriminant value.
    /// Returns \`None\` if the value doesn't match any variant.
    pub fn from_i32(value: i32) -> Option<${enumName}> {
        match value {
            ${fromI32Cases}
            _ => None,
        }
    }
}
`.trim();

  return {
    content: code,
    name: `${enumName}.rs`,
    subdirectory: [],
    language: "rust",
    platform: "shared",
  };
}

/**
 * Converts a C++ SCREAMING_CASE enum member name to Rust PascalCase.
 * E.g. "RED" -> "Red", "LIGHT_BLUE" -> "LightBlue"
 */
function toRustEnumMemberName(member: EnumMember): string {
  // The stringValue is the original TS name (camelCase or PascalCase).
  // The name is the C++ UPPER_CASE version.
  // For Rust, we want PascalCase — use the original string value.
  const original = member.stringValue;
  // Capitalize first letter
  return original.charAt(0).toUpperCase() + original.slice(1);
}
