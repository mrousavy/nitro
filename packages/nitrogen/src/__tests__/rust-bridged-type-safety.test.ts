import { describe, test, expect } from "bun:test";
import { RustCxxBridgedType } from "../syntax/rust/RustCxxBridgedType.js";
import { StringType } from "../syntax/types/StringType.js";
import { ErrorType } from "../syntax/types/ErrorType.js";
import { OptionalType } from "../syntax/types/OptionalType.js";
import { NumberType } from "../syntax/types/NumberType.js";
import { NullType } from "../syntax/types/NullType.js";
import { VoidType } from "../syntax/types/VoidType.js";
import { DateType } from "../syntax/types/DateType.js";

describe("RustCxxBridgedType - Safety fixes", () => {
  describe("CString construction (fix #2)", () => {
    test("string Rust->C++ strips null bytes instead of panicking", () => {
      const bridged = new RustCxxBridgedType(new StringType());
      const code = bridged.parse("name", "rust", "c++", "rust");

      // Should strip interior null bytes to avoid CString::new() panic
      expect(code).toContain("replace('\\0'");
      expect(code).toContain("unwrap_or_default()");
      // Should NOT have bare .unwrap()
      expect(code).not.toMatch(/CString::new\([^)]+\)\.unwrap\(\)/);
    });

    test("error Rust->C++ strips null bytes instead of panicking", () => {
      const bridged = new RustCxxBridgedType(new ErrorType());
      const code = bridged.parse("err", "rust", "c++", "rust");

      expect(code).toContain("replace('\\0'");
      expect(code).toContain("unwrap_or_default()");
    });
  });

  describe("Optional None value (fix #16)", () => {
    test("None case uses std::mem::zeroed() with safety comment", () => {
      const bridged = new RustCxxBridgedType(
        new OptionalType(new NumberType()),
      );
      const code = bridged.parse("opt", "rust", "c++", "rust");

      expect(code).toContain("std::mem::zeroed()");
      expect(code).toContain("SAFETY");
    });

    test("None case for string optional also has safety comment", () => {
      const bridged = new RustCxxBridgedType(
        new OptionalType(new StringType()),
      );
      const code = bridged.parse("opt", "rust", "c++", "rust");

      expect(code).toContain("std::mem::zeroed()");
      expect(code).toContain("SAFETY");
    });
  });

  describe("Null/Void type handling", () => {
    test("null type has no FFI type", () => {
      const bridged = new RustCxxBridgedType(new NullType());
      expect(bridged.hasType).toBe(false);
    });

    test("void type has no FFI type", () => {
      const bridged = new RustCxxBridgedType(new VoidType());
      expect(bridged.hasType).toBe(false);
    });

    test("null type getTypeCode returns void/unit", () => {
      const bridged = new RustCxxBridgedType(new NullType());
      expect(bridged.getTypeCode("c++")).toBe("void");
      expect(bridged.getTypeCode("rust")).toBe("()");
    });
  });

  describe("Parse direction correctness", () => {
    test("C++ to Rust (in Rust) for string: CStr", () => {
      const bridged = new RustCxxBridgedType(new StringType());
      const code = bridged.parse("s", "c++", "rust", "rust");
      expect(code).toContain("CStr::from_ptr");
      expect(code).toContain("to_string_lossy");
    });

    test("C++ to Rust (in C++) for string: c_str()", () => {
      const bridged = new RustCxxBridgedType(new StringType());
      const code = bridged.parse("s", "c++", "rust", "c++");
      expect(code).toContain("c_str()");
    });

    test("Rust to C++ (in Rust) for string: CString::new", () => {
      const bridged = new RustCxxBridgedType(new StringType());
      const code = bridged.parse("s", "rust", "c++", "rust");
      expect(code).toContain("CString::new");
      expect(code).toContain("into_raw");
    });

    test("Rust to C++ (in C++) for string: std::string + free", () => {
      const bridged = new RustCxxBridgedType(new StringType());
      const code = bridged.parse("s", "rust", "c++", "c++");
      expect(code).toContain("std::string");
      expect(code).toContain("__nitrogen_free_cstring");
    });

    test("date passes through in Rust (both directions)", () => {
      const bridged = new RustCxxBridgedType(new DateType());
      expect(bridged.parse("d", "c++", "rust", "rust")).toBe("d");
      expect(bridged.parse("d", "rust", "c++", "rust")).toBe("d");
    });

    test("date converts via chrono in C++", () => {
      const bridged = new RustCxxBridgedType(new DateType());
      const toRust = bridged.parse("d", "c++", "rust", "c++");
      expect(toRust).toContain("duration");
      expect(toRust).toContain("count()");

      const toCpp = bridged.parse("d", "rust", "c++", "c++");
      expect(toCpp).toContain("system_clock::time_point");
    });
  });
});
