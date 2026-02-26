import { describe, test, expect } from "bun:test";
import { createRustHybridObject } from "../syntax/rust/RustHybridObject.js";
import { createRustLibRs } from "../autolinking/rust/createRustAutolinking.js";
import { NitroConfig } from "../config/NitroConfig.js";
import { Method } from "../syntax/Method.js";
import { Property } from "../syntax/Property.js";
import { Parameter } from "../syntax/Parameter.js";
import { NumberType } from "../syntax/types/NumberType.js";
import { StringType } from "../syntax/types/StringType.js";
import { VoidType } from "../syntax/types/VoidType.js";
import { PromiseType } from "../syntax/types/PromiseType.js";
import { RustCxxBridgedType } from "../syntax/rust/RustCxxBridgedType.js";
import { BooleanType } from "../syntax/types/BooleanType.js";
import { Int64Type } from "../syntax/types/Int64Type.js";
import { ArrayType } from "../syntax/types/ArrayType.js";
import type { HybridObjectSpec } from "../syntax/HybridObjectSpec.js";

const mockConfig = new NitroConfig({
  cxxNamespace: ["image"],
  ios: { iosModuleName: "NitroImage" },
  android: {
    androidNamespace: ["image"],
    androidCxxLibName: "NitroImage",
  },
  autolinking: {},
  gitAttributesGeneratedFlag: true,
});

function makeSpec(
  name: string,
  properties: Property[],
  methods: Method[],
): HybridObjectSpec {
  return {
    name,
    language: "rust",
    properties,
    methods,
    baseTypes: [],
    isHybridView: false,
    config: mockConfig,
  };
}

describe("FFI Error Propagation", () => {
  describe("lib.rs generation", () => {
    test("includes __nitro_panic_to_cstring helper", () => {
      const libRs = createRustLibRs([]);
      expect(libRs.content).toContain("fn __nitro_panic_to_cstring");
      expect(libRs.content).toContain("downcast_ref::<&str>");
      expect(libRs.content).toContain("downcast_ref::<String>");
      expect(libRs.content).toContain("unknown Rust panic");
    });

    test("includes all __FfiResult_* structs", () => {
      const libRs = createRustLibRs([]);
      expect(libRs.content).toContain("#[repr(C)]\npub struct __FfiResult_void");
      expect(libRs.content).toContain("#[repr(C)]\npub struct __FfiResult_f64");
      expect(libRs.content).toContain("#[repr(C)]\npub struct __FfiResult_bool");
      expect(libRs.content).toContain("#[repr(C)]\npub struct __FfiResult_i32");
      expect(libRs.content).toContain("#[repr(C)]\npub struct __FfiResult_i64");
      expect(libRs.content).toContain("#[repr(C)]\npub struct __FfiResult_u64");
      expect(libRs.content).toContain("#[repr(C)]\npub struct __FfiResult_usize");
      expect(libRs.content).toContain("#[repr(C)]\npub struct __FfiResult_cstr");
      expect(libRs.content).toContain("#[repr(C)]\npub struct __FfiResult_ptr");
    });

    test("__FfiResult_void has is_ok and error fields only", () => {
      const libRs = createRustLibRs([]);
      expect(libRs.content).toContain(
        "pub struct __FfiResult_void {\n    pub is_ok: u8,\n    pub error: *mut std::ffi::c_char,\n}",
      );
    });

    test("__FfiResult_f64 has is_ok, error, and value fields", () => {
      const libRs = createRustLibRs([]);
      expect(libRs.content).toContain(
        "pub struct __FfiResult_f64 {\n    pub is_ok: u8,\n    pub error: *mut std::ffi::c_char,\n    pub value: f64,\n}",
      );
    });
  });

  describe("Rust FFI shims use catch_unwind", () => {
    test("property getter is wrapped in catch_unwind", () => {
      const spec = makeSpec(
        "Image",
        [new Property("width", new NumberType(), true)],
        [],
      );
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;

      expect(rsFile.content).toContain("catch_unwind");
      expect(rsFile.content).toContain("AssertUnwindSafe");
      expect(rsFile.content).toContain("__FfiResult_f64");
      expect(rsFile.content).toContain("is_ok: 1");
      expect(rsFile.content).toContain("is_ok: 0");
      expect(rsFile.content).toContain("__nitro_panic_to_cstring");
    });

    test("property setter is wrapped in catch_unwind", () => {
      const spec = makeSpec(
        "Image",
        [new Property("name", new StringType(), false)],
        [],
      );
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;

      // Setter should return __FfiResult_void
      expect(rsFile.content).toContain(
        "fn HybridImageSpec_set_name",
      );
      expect(rsFile.content).toContain("__FfiResult_void");
    });

    test("method is wrapped in catch_unwind", () => {
      const spec = makeSpec(
        "Image",
        [],
        [
          new Method("resize", new VoidType(), [
            new Parameter("width", new NumberType()),
            new Parameter("height", new NumberType()),
          ]),
        ],
      );
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;

      expect(rsFile.content).toContain("catch_unwind");
      expect(rsFile.content).toContain("__FfiResult_void");
    });

    test("memory_size is NOT wrapped in catch_unwind", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;

      // memory_size should return usize directly, not __FfiResult_usize
      expect(rsFile.content).toContain(
        "fn HybridImageSpec_memory_size(ptr: *mut std::ffi::c_void) -> usize",
      );
      // Verify it doesn't use catch_unwind by checking the function body
      const memSizeIdx = rsFile.content.indexOf("HybridImageSpec_memory_size");
      const destroyIdx = rsFile.content.indexOf("HybridImageSpec_destroy");
      const memSizeSection = rsFile.content.slice(memSizeIdx, destroyIdx);
      expect(memSizeSection).not.toContain("catch_unwind");
    });

    test("destroy is NOT wrapped in catch_unwind", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;

      // destroy should return void, not __FfiResult_void
      expect(rsFile.content).toContain(
        "fn HybridImageSpec_destroy(ptr: *mut std::ffi::c_void) {",
      );
      const destroyIdx = rsFile.content.indexOf("HybridImageSpec_destroy");
      const afterDestroy = rsFile.content.slice(destroyIdx);
      expect(afterDestroy).not.toContain("catch_unwind");
    });
  });

  describe("C++ bridge error checking", () => {
    test("has __throwRustError helper", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;

      expect(hpp.content).toContain("__throwRustError");
      expect(hpp.content).toContain("std::runtime_error");
      expect(hpp.content).toContain("__nitrogen_free_cstring");
      expect(hpp.content).toContain("[[noreturn]]");
    });

    test("includes <stdexcept> header", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;

      expect(hpp.content).toContain("#include <stdexcept>");
    });

    test("property getter checks is_ok", () => {
      const spec = makeSpec(
        "Image",
        [new Property("width", new NumberType(), true)],
        [],
      );
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;

      expect(hpp.content).toContain("if (!__ffi.is_ok)");
      expect(hpp.content).toContain("__throwRustError(__ffi.error)");
      expect(hpp.content).toContain("__ffi.value");
    });

    test("void method checks is_ok without returning value", () => {
      const spec = makeSpec(
        "Image",
        [],
        [new Method("doWork", new VoidType(), [])],
      );
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;

      expect(hpp.content).toContain("if (!__ffi.is_ok)");
      // void method should not return __ffi.value
      expect(hpp.content).toContain("void doWork() override");
    });

    test("Promise method checks is_ok inside async lambda", () => {
      const spec = makeSpec(
        "Image",
        [],
        [new Method("compute", new PromiseType(new NumberType()), [])],
      );
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;

      expect(hpp.content).toContain("Promise<double>::async(");
      expect(hpp.content).toContain("if (!__ffi.is_ok)");
      expect(hpp.content).toContain("__ffi.value");
    });

    test("C++ result struct definitions are generated", () => {
      const spec = makeSpec(
        "Image",
        [new Property("width", new NumberType(), true)],
        [],
      );
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;

      expect(hpp.content).toContain("struct __FfiResult_f64");
      expect(hpp.content).toContain("uint8_t is_ok");
      expect(hpp.content).toContain("char* error");
      expect(hpp.content).toContain("double value");
    });
  });

  describe("RustCxxBridgedType result type mapping", () => {
    test("number maps to __FfiResult_f64", () => {
      const bridged = new RustCxxBridgedType(new NumberType());
      expect(bridged.getRustFfiResultType()).toBe("__FfiResult_f64");
      expect(bridged.getCppFfiResultType()).toBe("__FfiResult_f64");
    });

    test("boolean maps to __FfiResult_bool", () => {
      const bridged = new RustCxxBridgedType(new BooleanType());
      expect(bridged.getRustFfiResultType()).toBe("__FfiResult_bool");
      expect(bridged.getCppFfiResultType()).toBe("__FfiResult_bool");
    });

    test("int64 maps to __FfiResult_i64", () => {
      const bridged = new RustCxxBridgedType(new Int64Type());
      expect(bridged.getRustFfiResultType()).toBe("__FfiResult_i64");
      expect(bridged.getCppFfiResultType()).toBe("__FfiResult_i64");
    });

    test("string maps to __FfiResult_cstr", () => {
      const bridged = new RustCxxBridgedType(new StringType());
      expect(bridged.getRustFfiResultType()).toBe("__FfiResult_cstr");
      expect(bridged.getCppFfiResultType()).toBe("__FfiResult_cstr");
    });

    test("void maps to __FfiResult_void", () => {
      const bridged = new RustCxxBridgedType(new VoidType());
      expect(bridged.getRustFfiResultType()).toBe("__FfiResult_void");
      expect(bridged.getCppFfiResultType()).toBe("__FfiResult_void");
    });

    test("array maps to __FfiResult_ptr", () => {
      const bridged = new RustCxxBridgedType(new ArrayType(new NumberType()));
      expect(bridged.getRustFfiResultType()).toBe("__FfiResult_ptr");
      expect(bridged.getCppFfiResultType()).toBe("__FfiResult_ptr");
    });
  });

  describe("Enum conversion uses panic instead of abort", () => {
    test("RustCxxBridgedType source code uses panic! instead of abort()", () => {
      // Verify at the source level that the enum conversion template uses panic!
      // (The actual enum bridging is tested via integration in rust-hybrid-object tests,
      // but we verify the template string here.)
      const fs = require("fs");
      const path = require("path");
      const bridgedTypeSource = fs.readFileSync(
        path.resolve(__dirname, "../syntax/rust/RustCxxBridgedType.ts"),
        "utf-8",
      );
      // Should use panic! for invalid discriminants (caught by catch_unwind)
      expect(bridgedTypeSource).toContain("panic!(");
      // Should NOT use abort for enum conversion
      expect(bridgedTypeSource).not.toContain("std::process::abort");
    });
  });
});
