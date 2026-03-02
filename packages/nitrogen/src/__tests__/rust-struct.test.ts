import { describe, test, expect } from "bun:test";
import { createRustStruct } from "../syntax/rust/RustStruct.js";
import { NamedWrappingType } from "../syntax/types/NamedWrappingType.js";
import { NumberType } from "../syntax/types/NumberType.js";
import { BooleanType } from "../syntax/types/BooleanType.js";
import { StringType } from "../syntax/types/StringType.js";
import { ArrayType } from "../syntax/types/ArrayType.js";
import { OptionalType } from "../syntax/types/OptionalType.js";

describe("RustStruct Generator", () => {
  test("generates struct with simple fields", () => {
    const props = [
      new NamedWrappingType("x", new NumberType()),
      new NamedWrappingType("y", new NumberType()),
    ];
    const file = createRustStruct("Point", props);

    expect(file.name).toBe("point.rs");
    expect(file.language).toBe("rust");
    expect(file.platform).toBe("shared");
    expect(file.content).toContain("#[derive(Debug, Clone, PartialEq)]");
    expect(file.content).toContain("pub struct Point");
    expect(file.content).toContain("pub x: f64,");
    expect(file.content).toContain("pub y: f64,");
  });

  test("generates struct with mixed types", () => {
    const props = [
      new NamedWrappingType("name", new StringType()),
      new NamedWrappingType("age", new NumberType()),
      new NamedWrappingType("isActive", new BooleanType()),
    ];
    const file = createRustStruct("Person", props);

    expect(file.content).toContain("pub struct Person");
    expect(file.content).toContain("pub name: String,");
    expect(file.content).toContain("pub age: f64,");
    expect(file.content).toContain("pub is_active: bool,");
  });

  test("converts camelCase field names to snake_case", () => {
    const props = [
      new NamedWrappingType("firstName", new StringType()),
      new NamedWrappingType("lastName", new StringType()),
      new NamedWrappingType("zipCode", new NumberType()),
    ];
    const file = createRustStruct("Address", props);

    expect(file.content).toContain("pub first_name: String,");
    expect(file.content).toContain("pub last_name: String,");
    expect(file.content).toContain("pub zip_code: f64,");
  });

  test("generates struct with complex types", () => {
    const props = [
      new NamedWrappingType("values", new ArrayType(new NumberType())),
      new NamedWrappingType("label", new OptionalType(new StringType())),
    ];
    const file = createRustStruct("Dataset", props);

    expect(file.content).toContain("pub values: Vec<f64>,");
    expect(file.content).toContain("pub label: Option<String>,");
  });

  test("includes derive(Debug, Clone) instead of repr(C)", () => {
    const props = [new NamedWrappingType("x", new NumberType())];
    const file = createRustStruct("Simple", props);

    expect(file.content).toContain("#[derive(Debug, Clone, PartialEq)]");
    expect(file.content).not.toContain("#[repr(C)]");
  });

  test("includes auto-generated comment", () => {
    const props = [new NamedWrappingType("x", new NumberType())];
    const file = createRustStruct("Simple", props);

    expect(file.content).toContain("DO NOT MODIFY");
  });
});
