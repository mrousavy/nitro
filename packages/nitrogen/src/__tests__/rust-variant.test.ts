import { describe, test, expect } from "bun:test";
import { createRustVariant } from "../syntax/rust/RustVariant.js";
import { VariantType } from "../syntax/types/VariantType.js";
import { NumberType } from "../syntax/types/NumberType.js";
import { StringType } from "../syntax/types/StringType.js";
import { BooleanType } from "../syntax/types/BooleanType.js";
import { ArrayType } from "../syntax/types/ArrayType.js";
import { OptionalType } from "../syntax/types/OptionalType.js";

describe("RustVariant Generator", () => {
  test("generates variant with correct file metadata", () => {
    const variant = new VariantType(
      [new NumberType(), new StringType()],
      "NumberOrString",
    );
    const file = createRustVariant(variant);

    expect(file.name).toBe("number_or_string.rs");
    expect(file.language).toBe("rust");
    expect(file.platform).toBe("shared");
  });

  test("generates enum with #[derive(Debug, Clone, PartialEq)]", () => {
    const variant = new VariantType(
      [new NumberType(), new StringType()],
      "NumberOrString",
    );
    const file = createRustVariant(variant);

    expect(file.content).toContain("#[derive(Debug, Clone, PartialEq)]");
  });

  test("does not use #[repr(C)] (variants are passed as opaque pointers)", () => {
    const variant = new VariantType(
      [new NumberType(), new StringType()],
      "NumberOrString",
    );
    const file = createRustVariant(variant);

    expect(file.content).not.toContain("#[repr(C)]");
  });

  test("generates cases with capitalized labels", () => {
    const variant = new VariantType(
      [new NumberType(), new StringType(), new BooleanType()],
      "MyVariant",
    );
    const file = createRustVariant(variant);

    expect(file.content).toContain("First(f64),");
    expect(file.content).toContain("Second(String),");
    expect(file.content).toContain("Third(bool),");
  });

  test("uses aliasName for enum declaration name", () => {
    const variant = new VariantType(
      [new NumberType(), new StringType()],
      "NumberOrString",
    );
    const file = createRustVariant(variant);

    expect(file.content).toContain("pub enum NumberOrString {");
  });

  test("generates auto-aliased name when no aliasName provided", () => {
    const variant = new VariantType([new NumberType(), new StringType()]);
    const file = createRustVariant(variant);

    // Auto-generated alias should use the Rust type codes
    expect(file.content).toContain("Variant_f64_String");
  });

  test("handles complex inner types", () => {
    const variant = new VariantType(
      [
        new ArrayType(new NumberType()),
        new OptionalType(new StringType()),
      ],
      "ComplexVariant",
    );
    const file = createRustVariant(variant);

    expect(file.content).toContain("First(Vec<f64>),");
    expect(file.content).toContain("Second(Option<String>),");
  });

  test("includes auto-generated header", () => {
    const variant = new VariantType(
      [new NumberType()],
      "SingleVariant",
    );
    const file = createRustVariant(variant);

    expect(file.content).toContain("DO NOT MODIFY");
  });

  test("uses #![allow(...)] inner attribute (valid in module files)", () => {
    const variant = new VariantType(
      [new NumberType()],
      "MyVariant",
    );
    const file = createRustVariant(variant);

    expect(file.content).toContain("#![allow(");
  });
});
