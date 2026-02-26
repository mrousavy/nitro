import { describe, test, expect } from "bun:test";
import { createRustEnum } from "../syntax/rust/RustEnum.js";
import type { EnumType, EnumMember } from "../syntax/types/EnumType.js";

/**
 * Create a mock EnumType for testing.
 * The real EnumType requires ts-morph objects (EnumDeclaration or TSMorphType),
 * but createRustEnum only reads enumName and enumMembers.
 */
function mockEnumType(
  enumName: string,
  members: EnumMember[],
): EnumType {
  return {
    enumName,
    enumMembers: members,
  } as unknown as EnumType;
}

describe("RustEnum Generator", () => {
  test("generates enum with correct file metadata", () => {
    const enumType = mockEnumType("Color", [
      { name: "RED", value: 0, stringValue: "red" },
      { name: "GREEN", value: 1, stringValue: "green" },
      { name: "BLUE", value: 2, stringValue: "blue" },
    ]);
    const file = createRustEnum(enumType);

    expect(file.name).toBe("Color.rs");
    expect(file.language).toBe("rust");
    expect(file.platform).toBe("shared");
  });

  test("generates enum with #[repr(i32)]", () => {
    const enumType = mockEnumType("Color", [
      { name: "RED", value: 0, stringValue: "red" },
    ]);
    const file = createRustEnum(enumType);

    expect(file.content).toContain("#[repr(i32)]");
  });

  test("generates enum with derive traits", () => {
    const enumType = mockEnumType("Color", [
      { name: "RED", value: 0, stringValue: "red" },
    ]);
    const file = createRustEnum(enumType);

    expect(file.content).toContain(
      "#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]",
    );
  });

  test("generates enum variants with correct discriminants", () => {
    const enumType = mockEnumType("Color", [
      { name: "RED", value: 0, stringValue: "red" },
      { name: "GREEN", value: 1, stringValue: "green" },
      { name: "BLUE", value: 2, stringValue: "blue" },
    ]);
    const file = createRustEnum(enumType);

    expect(file.content).toContain("Red = 0,");
    expect(file.content).toContain("Green = 1,");
    expect(file.content).toContain("Blue = 2,");
  });

  test("generates from_i32 implementation", () => {
    const enumType = mockEnumType("Color", [
      { name: "RED", value: 0, stringValue: "red" },
      { name: "GREEN", value: 1, stringValue: "green" },
    ]);
    const file = createRustEnum(enumType);

    expect(file.content).toContain("pub fn from_i32(value: i32) -> Option<Color>");
    expect(file.content).toContain("0 => Some(Color::Red),");
    expect(file.content).toContain("1 => Some(Color::Green),");
    expect(file.content).toContain("_ => None,");
  });

  test("uses PascalCase variant names from stringValue", () => {
    const enumType = mockEnumType("Direction", [
      { name: "UP", value: 0, stringValue: "up" },
      { name: "DOWN", value: 1, stringValue: "down" },
      { name: "LEFT_RIGHT", value: 2, stringValue: "leftRight" },
    ]);
    const file = createRustEnum(enumType);

    // stringValue first char is capitalized
    expect(file.content).toContain("Up = 0,");
    expect(file.content).toContain("Down = 1,");
    // "leftRight" -> "LeftRight" (first char capitalized)
    expect(file.content).toContain("LeftRight = 2,");
  });

  test("includes auto-generated header", () => {
    const enumType = mockEnumType("Color", [
      { name: "RED", value: 0, stringValue: "red" },
    ]);
    const file = createRustEnum(enumType);

    expect(file.content).toContain("DO NOT MODIFY");
  });

  test("generates correct enum name in type declaration", () => {
    const enumType = mockEnumType("MyCustomEnum", [
      { name: "A", value: 0, stringValue: "a" },
    ]);
    const file = createRustEnum(enumType);

    expect(file.content).toContain("pub enum MyCustomEnum");
    expect(file.content).toContain("impl MyCustomEnum");
  });

  test("handles non-contiguous discriminant values", () => {
    const enumType = mockEnumType("Status", [
      { name: "OK", value: 0, stringValue: "ok" },
      { name: "ERROR", value: 100, stringValue: "error" },
      { name: "UNKNOWN", value: 999, stringValue: "unknown" },
    ]);
    const file = createRustEnum(enumType);

    expect(file.content).toContain("Ok = 0,");
    expect(file.content).toContain("Error = 100,");
    expect(file.content).toContain("Unknown = 999,");
    expect(file.content).toContain("100 => Some(Status::Error),");
  });

  test("uses #![allow(...)] inner attribute (valid in module files)", () => {
    const enumType = mockEnumType("Color", [
      { name: "RED", value: 0, stringValue: "red" },
    ]);
    const file = createRustEnum(enumType);

    expect(file.content).toContain("#![allow(");
  });
});
