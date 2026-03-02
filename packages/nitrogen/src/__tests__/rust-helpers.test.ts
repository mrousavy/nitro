import { describe, test, expect } from "bun:test";
import {
  toSnakeCase,
  createRustFileMetadataString,
} from "../syntax/helpers.js";

describe("toSnakeCase", () => {
  test("simple camelCase", () => {
    expect(toSnakeCase("myMethod")).toBe("my_method");
  });

  test("simple lowercase stays the same", () => {
    expect(toSnakeCase("name")).toBe("name");
  });

  test("PascalCase", () => {
    expect(toSnakeCase("MyMethod")).toBe("my_method");
  });

  test("already snake_case stays the same", () => {
    expect(toSnakeCase("my_method")).toBe("my_method");
  });

  test("single word", () => {
    expect(toSnakeCase("resize")).toBe("resize");
  });

  test("isBoolean prefix", () => {
    expect(toSnakeCase("isFast")).toBe("is_fast");
  });

  test("acronyms are kept together: HTTP", () => {
    expect(toSnakeCase("getHTTPResponse")).toBe("get_http_response");
  });

  test("acronyms are kept together: URL", () => {
    expect(toSnakeCase("parseURL")).toBe("parse_url");
  });

  test("acronyms are kept together: XMLParser", () => {
    expect(toSnakeCase("XMLParser")).toBe("xml_parser");
  });

  test("acronyms at end: getID", () => {
    expect(toSnakeCase("getID")).toBe("get_id");
  });

  test("single capital letter", () => {
    expect(toSnakeCase("getX")).toBe("get_x");
  });

  test("numbers in name", () => {
    expect(toSnakeCase("get2DPoint")).toBe("get2_d_point");
  });

  test("consecutive camelCase words", () => {
    expect(toSnakeCase("firstName")).toBe("first_name");
    expect(toSnakeCase("lastName")).toBe("last_name");
    expect(toSnakeCase("zipCode")).toBe("zip_code");
  });
});

describe("createRustFileMetadataString", () => {
  test("lib.rs uses inner attribute #![allow(...)]", () => {
    const header = createRustFileMetadataString("lib.rs");
    expect(header).toContain("#![allow(");
    expect(header).not.toContain("\n#[allow(");
  });

  test("non-lib.rs files also use inner attribute #![allow(...)]", () => {
    // Inner attributes (#![allow(...)]) are valid in any module file
    // included via `mod filename;`, not just the crate root.
    const header = createRustFileMetadataString("MyStruct.rs");
    expect(header).toContain("#![allow(");
  });

  test("includes DO NOT MODIFY warning", () => {
    const header = createRustFileMetadataString("test.rs");
    expect(header).toContain("DO NOT MODIFY");
  });

  test("includes filename in comment", () => {
    const header = createRustFileMetadataString("MyModule.rs");
    expect(header).toContain("// MyModule.rs");
  });

  test("uses targeted clippy suppressions instead of clippy::all", () => {
    const header = createRustFileMetadataString("test.rs");
    expect(header).not.toContain("clippy::all");
    expect(header).toContain("clippy::needless_return");
    expect(header).toContain("clippy::redundant_closure");
  });

  test("uses regular comments (//) not doc comments (///)", () => {
    const header = createRustFileMetadataString("test.rs");
    const lines = header.split("\n");
    const commentLines = lines.filter((l) => l.startsWith("//"));
    for (const line of commentLines) {
      expect(line).not.toMatch(/^\/\/\//);
    }
  });
});
