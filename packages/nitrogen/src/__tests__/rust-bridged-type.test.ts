import { describe, test, expect } from "bun:test";
import { RustCxxBridgedType } from "../syntax/rust/RustCxxBridgedType.js";
import { NumberType } from "../syntax/types/NumberType.js";
import { BooleanType } from "../syntax/types/BooleanType.js";
import { StringType } from "../syntax/types/StringType.js";
import { VoidType } from "../syntax/types/VoidType.js";
import { Int64Type } from "../syntax/types/Int64Type.js";
import { UInt64Type } from "../syntax/types/UInt64Type.js";
import { NullType } from "../syntax/types/NullType.js";
import { DateType } from "../syntax/types/DateType.js";
import { ErrorType } from "../syntax/types/ErrorType.js";
import { ArrayBufferType } from "../syntax/types/ArrayBufferType.js";
import { ArrayType } from "../syntax/types/ArrayType.js";
import { OptionalType } from "../syntax/types/OptionalType.js";
import { RecordType } from "../syntax/types/RecordType.js";

// Note: EnumType, StructType, VariantType, HybridObjectType, FunctionType
// require ts-morph objects to construct and cannot be unit-tested without a TS project.
// Those types are covered by integration tests.

describe("RustCxxBridgedType", () => {
  describe("hasType", () => {
    test("void has no type", () => {
      const bridged = new RustCxxBridgedType(new VoidType());
      expect(bridged.hasType).toBe(false);
    });

    test("null has no type", () => {
      const bridged = new RustCxxBridgedType(new NullType());
      expect(bridged.hasType).toBe(false);
    });

    test("number has type", () => {
      const bridged = new RustCxxBridgedType(new NumberType());
      expect(bridged.hasType).toBe(true);
    });

    test("string has type", () => {
      const bridged = new RustCxxBridgedType(new StringType());
      expect(bridged.hasType).toBe(true);
    });
  });

  describe("needsSpecialHandling", () => {
    test("primitives do not need special handling", () => {
      expect(
        new RustCxxBridgedType(new NumberType()).needsSpecialHandling,
      ).toBe(false);
      expect(
        new RustCxxBridgedType(new BooleanType()).needsSpecialHandling,
      ).toBe(false);
      expect(new RustCxxBridgedType(new Int64Type()).needsSpecialHandling).toBe(
        false,
      );
      expect(
        new RustCxxBridgedType(new UInt64Type()).needsSpecialHandling,
      ).toBe(false);
    });

    test("void and null do not need special handling", () => {
      expect(new RustCxxBridgedType(new VoidType()).needsSpecialHandling).toBe(
        false,
      );
      expect(new RustCxxBridgedType(new NullType()).needsSpecialHandling).toBe(
        false,
      );
    });

    test("string needs special handling", () => {
      expect(
        new RustCxxBridgedType(new StringType()).needsSpecialHandling,
      ).toBe(true);
    });

    test("date needs special handling", () => {
      expect(new RustCxxBridgedType(new DateType()).needsSpecialHandling).toBe(
        true,
      );
    });

    test("error needs special handling", () => {
      expect(new RustCxxBridgedType(new ErrorType()).needsSpecialHandling).toBe(
        true,
      );
    });

    test("array needs special handling", () => {
      expect(
        new RustCxxBridgedType(new ArrayType(new NumberType()))
          .needsSpecialHandling,
      ).toBe(true);
    });

    test("optional needs special handling", () => {
      expect(
        new RustCxxBridgedType(new OptionalType(new NumberType()))
          .needsSpecialHandling,
      ).toBe(true);
    });

    test("record needs special handling", () => {
      expect(
        new RustCxxBridgedType(
          new RecordType(new StringType(), new NumberType()),
        ).needsSpecialHandling,
      ).toBe(true);
    });

    test("array buffer needs special handling", () => {
      expect(
        new RustCxxBridgedType(new ArrayBufferType()).needsSpecialHandling,
      ).toBe(true);
    });
  });

  describe("getTypeCode - C++ FFI types", () => {
    test("void -> void", () => {
      const bridged = new RustCxxBridgedType(new VoidType());
      expect(bridged.getTypeCode("c++")).toBe("void");
    });

    test("number -> double", () => {
      const bridged = new RustCxxBridgedType(new NumberType());
      expect(bridged.getTypeCode("c++")).toBe("double");
    });

    test("boolean -> bool", () => {
      const bridged = new RustCxxBridgedType(new BooleanType());
      expect(bridged.getTypeCode("c++")).toBe("bool");
    });

    test("int64 -> int64_t", () => {
      const bridged = new RustCxxBridgedType(new Int64Type());
      expect(bridged.getTypeCode("c++")).toBe("int64_t");
    });

    test("uint64 -> uint64_t", () => {
      const bridged = new RustCxxBridgedType(new UInt64Type());
      expect(bridged.getTypeCode("c++")).toBe("uint64_t");
    });

    test("string -> const char*", () => {
      const bridged = new RustCxxBridgedType(new StringType());
      expect(bridged.getTypeCode("c++")).toBe("const char*");
    });

    test("date -> double", () => {
      const bridged = new RustCxxBridgedType(new DateType());
      expect(bridged.getTypeCode("c++")).toBe("double");
    });

    test("error -> const char*", () => {
      const bridged = new RustCxxBridgedType(new ErrorType());
      expect(bridged.getTypeCode("c++")).toBe("const char*");
    });

    test("array -> void*", () => {
      const bridged = new RustCxxBridgedType(new ArrayType(new NumberType()));
      expect(bridged.getTypeCode("c++")).toBe("void*");
    });

    test("optional -> void*", () => {
      const bridged = new RustCxxBridgedType(
        new OptionalType(new NumberType()),
      );
      expect(bridged.getTypeCode("c++")).toBe("void*");
    });

    test("array buffer -> void*", () => {
      const bridged = new RustCxxBridgedType(new ArrayBufferType());
      expect(bridged.getTypeCode("c++")).toBe("void*");
    });

    test("null -> void", () => {
      const bridged = new RustCxxBridgedType(new NullType());
      expect(bridged.getTypeCode("c++")).toBe("void");
    });

    test("record -> void*", () => {
      const bridged = new RustCxxBridgedType(
        new RecordType(new StringType(), new NumberType()),
      );
      expect(bridged.getTypeCode("c++")).toBe("void*");
    });
  });

  describe("getTypeCode - Rust FFI types", () => {
    test("void -> ()", () => {
      const bridged = new RustCxxBridgedType(new VoidType());
      expect(bridged.getTypeCode("rust")).toBe("()");
    });

    test("number -> f64", () => {
      const bridged = new RustCxxBridgedType(new NumberType());
      expect(bridged.getTypeCode("rust")).toBe("f64");
    });

    test("boolean -> bool", () => {
      const bridged = new RustCxxBridgedType(new BooleanType());
      expect(bridged.getTypeCode("rust")).toBe("bool");
    });

    test("int64 -> i64", () => {
      const bridged = new RustCxxBridgedType(new Int64Type());
      expect(bridged.getTypeCode("rust")).toBe("i64");
    });

    test("uint64 -> u64", () => {
      const bridged = new RustCxxBridgedType(new UInt64Type());
      expect(bridged.getTypeCode("rust")).toBe("u64");
    });

    test("string -> *const std::ffi::c_char", () => {
      const bridged = new RustCxxBridgedType(new StringType());
      expect(bridged.getTypeCode("rust")).toBe("*const std::ffi::c_char");
    });

    test("date -> f64", () => {
      const bridged = new RustCxxBridgedType(new DateType());
      expect(bridged.getTypeCode("rust")).toBe("f64");
    });

    test("error -> *const std::ffi::c_char", () => {
      const bridged = new RustCxxBridgedType(new ErrorType());
      expect(bridged.getTypeCode("rust")).toBe("*const std::ffi::c_char");
    });

    test("array -> *mut std::ffi::c_void", () => {
      const bridged = new RustCxxBridgedType(new ArrayType(new NumberType()));
      expect(bridged.getTypeCode("rust")).toBe("*mut std::ffi::c_void");
    });

    test("optional -> *mut std::ffi::c_void", () => {
      const bridged = new RustCxxBridgedType(
        new OptionalType(new NumberType()),
      );
      expect(bridged.getTypeCode("rust")).toBe("*mut std::ffi::c_void");
    });

    test("null -> ()", () => {
      const bridged = new RustCxxBridgedType(new NullType());
      expect(bridged.getTypeCode("rust")).toBe("()");
    });
  });

  describe("parse - string conversions", () => {
    const bridged = new RustCxxBridgedType(new StringType());

    test("C++ to Rust (in Rust): CStr to String", () => {
      const code = bridged.parse("name", "c++", "rust", "rust");
      expect(code).toContain("CStr::from_ptr");
      expect(code).toContain("name");
      expect(code).toContain("to_string_lossy");
    });

    test("C++ to Rust (in C++): pass c_str()", () => {
      const code = bridged.parse("name", "c++", "rust", "c++");
      expect(code).toContain("c_str()");
      expect(code).toContain("name");
    });

    test("Rust to C++ (in Rust): CString into_raw", () => {
      const code = bridged.parse("name", "rust", "c++", "rust");
      expect(code).toContain("CString::new");
      expect(code).toContain("into_raw");
    });

    test("Rust to C++ (in C++): construct std::string and free CString", () => {
      const code = bridged.parse("name", "rust", "c++", "c++");
      expect(code).toContain("std::string");
      expect(code).toContain("name");
      expect(code).toContain("__nitrogen_free_cstring");
    });
  });

  describe("parse - date conversions", () => {
    const bridged = new RustCxxBridgedType(new DateType());

    test("C++ to Rust (in C++): chrono to double", () => {
      const code = bridged.parse("date", "c++", "rust", "c++");
      expect(code).toContain("duration");
      expect(code).toContain("milli");
      expect(code).toContain("count()");
    });

    test("Rust to C++ (in C++): double to chrono", () => {
      const code = bridged.parse("date", "rust", "c++", "c++");
      expect(code).toContain("system_clock::time_point");
      expect(code).toContain("duration_cast");
    });

    test("C++ to Rust (in Rust): passthrough f64", () => {
      const code = bridged.parse("date", "c++", "rust", "rust");
      expect(code).toBe("date");
    });

    test("Rust to C++ (in Rust): passthrough f64", () => {
      const code = bridged.parse("date", "rust", "c++", "rust");
      expect(code).toBe("date");
    });
  });

  describe("parse - error conversions", () => {
    const bridged = new RustCxxBridgedType(new ErrorType());

    test("C++ to Rust (in C++): extract error message", () => {
      const code = bridged.parse("err", "c++", "rust", "c++");
      expect(code).toContain("rethrow_exception");
      expect(code).toContain("what()");
    });

    test("C++ to Rust (in Rust): CStr to String", () => {
      const code = bridged.parse("err", "c++", "rust", "rust");
      expect(code).toContain("CStr::from_ptr");
      expect(code).toContain("to_string_lossy");
    });

    test("Rust to C++ (in Rust): CString into_raw", () => {
      const code = bridged.parse("err", "rust", "c++", "rust");
      expect(code).toContain("CString::new");
      expect(code).toContain("into_raw");
    });

    test("Rust to C++ (in C++): make_exception_ptr and free CString", () => {
      const code = bridged.parse("err", "rust", "c++", "c++");
      expect(code).toContain("make_exception_ptr");
      expect(code).toContain("runtime_error");
      expect(code).toContain("__nitrogen_free_cstring");
    });
  });

  describe("parse - primitives pass through", () => {
    test("number passes through in both directions", () => {
      const bridged = new RustCxxBridgedType(new NumberType());
      expect(bridged.parse("val", "c++", "rust", "rust")).toBe("val");
      expect(bridged.parse("val", "c++", "rust", "c++")).toBe("val");
      expect(bridged.parse("val", "rust", "c++", "rust")).toBe("val");
      expect(bridged.parse("val", "rust", "c++", "c++")).toBe("val");
    });

    test("boolean passes through", () => {
      const bridged = new RustCxxBridgedType(new BooleanType());
      expect(bridged.parse("flag", "c++", "rust", "rust")).toBe("flag");
      expect(bridged.parse("flag", "rust", "c++", "c++")).toBe("flag");
    });

    test("int64 passes through", () => {
      const bridged = new RustCxxBridgedType(new Int64Type());
      expect(bridged.parse("n", "c++", "rust", "rust")).toBe("n");
    });

    test("uint64 passes through", () => {
      const bridged = new RustCxxBridgedType(new UInt64Type());
      expect(bridged.parse("n", "rust", "c++", "c++")).toBe("n");
    });
  });

  describe("parse - void and null return empty", () => {
    test("void returns empty string", () => {
      const bridged = new RustCxxBridgedType(new VoidType());
      expect(bridged.parse("x", "c++", "rust", "rust")).toBe("");
      expect(bridged.parse("x", "rust", "c++", "c++")).toBe("");
    });

    test("null returns empty string", () => {
      const bridged = new RustCxxBridgedType(new NullType());
      expect(bridged.parse("x", "c++", "rust", "rust")).toBe("");
      expect(bridged.parse("x", "rust", "c++", "c++")).toBe("");
    });
  });

  describe("getRustFfiType / getCppFfiType convenience methods", () => {
    test("number: f64 / double", () => {
      const bridged = new RustCxxBridgedType(new NumberType());
      expect(bridged.getRustFfiType()).toBe("f64");
      expect(bridged.getCppFfiType()).toBe("double");
    });

    test("string: *const c_char / const char*", () => {
      const bridged = new RustCxxBridgedType(new StringType());
      expect(bridged.getRustFfiType()).toBe("*const std::ffi::c_char");
      expect(bridged.getCppFfiType()).toBe("const char*");
    });

    test("boolean: bool / bool", () => {
      const bridged = new RustCxxBridgedType(new BooleanType());
      expect(bridged.getRustFfiType()).toBe("bool");
      expect(bridged.getCppFfiType()).toBe("bool");
    });

    test("date: f64 / double", () => {
      const bridged = new RustCxxBridgedType(new DateType());
      expect(bridged.getRustFfiType()).toBe("f64");
      expect(bridged.getCppFfiType()).toBe("double");
    });

    test("array buffer: *mut c_void / void*", () => {
      const bridged = new RustCxxBridgedType(new ArrayBufferType());
      expect(bridged.getRustFfiType()).toBe("*mut std::ffi::c_void");
      expect(bridged.getCppFfiType()).toBe("void*");
    });

    test("array: *mut c_void / void*", () => {
      const bridged = new RustCxxBridgedType(new ArrayType(new NumberType()));
      expect(bridged.getRustFfiType()).toBe("*mut std::ffi::c_void");
      expect(bridged.getCppFfiType()).toBe("void*");
    });

    test("optional: *mut c_void / void*", () => {
      const bridged = new RustCxxBridgedType(
        new OptionalType(new NumberType()),
      );
      expect(bridged.getRustFfiType()).toBe("*mut std::ffi::c_void");
      expect(bridged.getCppFfiType()).toBe("void*");
    });

    test("record: *mut c_void / void*", () => {
      const bridged = new RustCxxBridgedType(
        new RecordType(new StringType(), new NumberType()),
      );
      expect(bridged.getRustFfiType()).toBe("*mut std::ffi::c_void");
      expect(bridged.getCppFfiType()).toBe("void*");
    });
  });

  describe("parse - array conversions", () => {
    const bridged = new RustCxxBridgedType(new ArrayType(new NumberType()));

    test("C++ to Rust (in Rust): Box::from_raw to Vec", () => {
      const code = bridged.parse("arr", "c++", "rust", "rust");
      expect(code).toContain("Box::from_raw");
      expect(code).toContain("arr");
    });

    test("C++ to Rust (in C++): heap-allocate and cast to void*", () => {
      const code = bridged.parse("arr", "c++", "rust", "c++");
      expect(code).toContain("static_cast<void*>");
      expect(code).toContain("new");
    });

    test("Rust to C++ (in Rust): Box::into_raw", () => {
      const code = bridged.parse("arr", "rust", "c++", "rust");
      expect(code).toContain("Box::into_raw");
      expect(code).toContain("Box::new");
    });

    test("Rust to C++ (in C++): static_cast back", () => {
      const code = bridged.parse("arr", "rust", "c++", "c++");
      expect(code).toContain("static_cast");
      expect(code).toContain("std::move");
    });
  });

  describe("parse - optional conversions", () => {
    const stringOptBridged = new RustCxxBridgedType(
      new OptionalType(new StringType()),
    );
    const numberOptBridged = new RustCxxBridgedType(
      new OptionalType(new NumberType()),
    );

    test("Rust to C++ (in Rust): uses repr(C) __Opt struct with has_value discriminant", () => {
      const code = stringOptBridged.parse("opt", "rust", "c++", "rust");
      expect(code).toContain("#[repr(C)] struct __Opt");
      expect(code).toContain("has_value: u8");
      expect(code).toContain("Box::into_raw");
      expect(code).toContain("match opt");
      expect(code).toContain("Some(__v)");
      // Inner string should be converted to CString
      expect(code).toContain("CString::new");
    });

    test("Rust to C++ (in C++): unboxes __Opt struct and reconstructs std::optional", () => {
      const code = stringOptBridged.parse("opt", "rust", "c++", "c++");
      expect(code).toContain("struct __Opt");
      expect(code).toContain("has_value");
      expect(code).toContain("std::optional<std::string>");
      // Inner value should be converted from const char* to std::string and freed
      expect(code).toContain("std::string");
      expect(code).toContain("__nitrogen_free_cstring");
    });

    test("C++ to Rust (in Rust): unboxes __Opt struct and reconstructs Option", () => {
      const code = stringOptBridged.parse("opt", "c++", "rust", "rust");
      expect(code).toContain("#[repr(C)] struct __Opt");
      expect(code).toContain("Box::from_raw");
      expect(code).toContain("has_value");
      expect(code).toContain("Some(");
      expect(code).toContain("None");
    });

    test("C++ to Rust (in C++): boxes __Opt struct as void*", () => {
      const code = stringOptBridged.parse("opt", "c++", "rust", "c++");
      expect(code).toContain("struct __Opt");
      expect(code).toContain("has_value");
      expect(code).toContain("static_cast<void*>");
      // Inner string should be converted via c_str()
      expect(code).toContain("c_str()");
      // Must use const auto& to avoid dangling pointer (UAF fix)
      expect(code).toContain("const auto& __inner");
      expect(code).not.toContain("auto __inner");
    });

    test("primitive optional (number) passes inner value directly", () => {
      const rustCode = numberOptBridged.parse("opt", "rust", "c++", "rust");
      expect(rustCode).toContain("#[repr(C)] struct __Opt");
      expect(rustCode).toContain("has_value: u8");
      expect(rustCode).toContain("value: f64");
      // Should NOT contain CString conversion for primitives
      expect(rustCode).not.toContain("CString");
    });
  });

  describe("parse - array buffer conversions", () => {
    const bridged = new RustCxxBridgedType(new ArrayBufferType());

    test("C++ to Rust (in Rust): Box::from_raw to NitroBuffer", () => {
      const code = bridged.parse("buf", "c++", "rust", "rust");
      expect(code).toContain("Box::from_raw");
      expect(code).toContain("NitroBuffer");
    });

    test("C++ to Rust (in C++): creates NitroBuffer struct with zero-copy", () => {
      const code = bridged.parse("buf", "c++", "rust", "c++");
      expect(code).toContain("__NB");
      expect(code).toContain("data");
      expect(code).toContain("release_fn");
      expect(code).toContain("shared_ptr<ArrayBuffer>");
    });

    test("Rust to C++ (in Rust): Box::into_raw", () => {
      const code = bridged.parse("buf", "rust", "c++", "rust");
      expect(code).toContain("Box::into_raw");
    });

    test("Rust to C++ (in C++): unwrap NitroBuffer and wrap in ArrayBuffer", () => {
      const code = bridged.parse("buf", "rust", "c++", "c++");
      expect(code).toContain("ArrayBuffer::wrap");
      expect(code).toContain("__NB");
      expect(code).toContain("release");
    });
  });
});
