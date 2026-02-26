import { describe, test, expect } from "bun:test";
import { createRustHybridObject } from "../syntax/rust/RustHybridObject.js";
import { NitroConfig } from "../config/NitroConfig.js";
import { Method } from "../syntax/Method.js";
import { Property } from "../syntax/Property.js";
import { Parameter } from "../syntax/Parameter.js";
import { NumberType } from "../syntax/types/NumberType.js";
import { StringType } from "../syntax/types/StringType.js";

import { VoidType } from "../syntax/types/VoidType.js";
import { ArrayType } from "../syntax/types/ArrayType.js";
import { OptionalType } from "../syntax/types/OptionalType.js";
import { DateType } from "../syntax/types/DateType.js";
import { PromiseType } from "../syntax/types/PromiseType.js";
import { FunctionType } from "../syntax/types/FunctionType.js";
import { NamedWrappingType } from "../syntax/types/NamedWrappingType.js";
import { createRustFunction } from "../syntax/rust/RustFunction.js";
import type { HybridObjectSpec } from "../syntax/HybridObjectSpec.js";

// Create a mock NitroConfig for testing
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

describe("Rust HybridObject Generator", () => {
  test("generates correct number of files", () => {
    const spec = makeSpec("Image", [], []);
    const files = createRustHybridObject(spec);
    expect(files).toHaveLength(3);
  });

  test("generates files with correct names", () => {
    const spec = makeSpec("Image", [], []);
    const files = createRustHybridObject(spec);
    const names = files.map((f) => f.name);
    expect(names).toContain("HybridImageSpec.rs");
    expect(names).toContain("HybridImageSpecRust.hpp");
    expect(names).toContain("HybridImageSpecRust.cpp");
  });

  test("generates files with correct languages and platforms", () => {
    const spec = makeSpec("Image", [], []);
    const files = createRustHybridObject(spec);

    const traitFile = files.find((f) => f.name === "HybridImageSpec.rs")!;
    expect(traitFile.language).toBe("rust");
    expect(traitFile.platform).toBe("shared");

    const hppFile = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;
    expect(hppFile.language).toBe("c++");
    expect(hppFile.platform).toBe("shared");

    const cppFile = files.find((f) => f.name === "HybridImageSpecRust.cpp")!;
    expect(cppFile.language).toBe("c++");
    expect(cppFile.platform).toBe("shared");
  });

  describe("Rust trait file", () => {
    test("contains trait declaration", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const traitFile = files.find((f) => f.name === "HybridImageSpec.rs")!;
      expect(traitFile.content).toContain(
        "pub trait HybridImageSpec: Send + Sync",
      );
    });

    test("contains readonly property getter", () => {
      const spec = makeSpec(
        "Image",
        [new Property("width", new NumberType(), true)],
        [],
      );
      const files = createRustHybridObject(spec);
      const traitFile = files.find((f) => f.name === "HybridImageSpec.rs")!;
      expect(traitFile.content).toContain("fn get_width(&self) -> f64;");
    });

    test("contains read-write property getter and setter", () => {
      const spec = makeSpec(
        "Image",
        [new Property("name", new StringType(), false)],
        [],
      );
      const files = createRustHybridObject(spec);
      const traitFile = files.find((f) => f.name === "HybridImageSpec.rs")!;
      expect(traitFile.content).toContain("fn get_name(&self) -> String;");
      expect(traitFile.content).toContain(
        "fn set_name(&mut self, value: String);",
      );
    });

    test("contains method signatures", () => {
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
      const traitFile = files.find((f) => f.name === "HybridImageSpec.rs")!;
      expect(traitFile.content).toContain(
        "fn resize(&mut self, width: f64, height: f64) -> Result<(), String>;",
      );
    });

    test("contains method with return type", () => {
      const spec = makeSpec(
        "Image",
        [],
        [new Method("getName", new StringType(), [])],
      );
      const files = createRustHybridObject(spec);
      const traitFile = files.find((f) => f.name === "HybridImageSpec.rs")!;
      expect(traitFile.content).toContain(
        "fn get_name(&mut self) -> Result<String, String>;",
      );
    });

    test("contains auto-generated header comment", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const traitFile = files.find((f) => f.name === "HybridImageSpec.rs")!;
      expect(traitFile.content).toContain("DO NOT MODIFY");
    });
  });

  describe("Rust FFI shims (in combined file)", () => {
    test("generates property getter shim", () => {
      const spec = makeSpec(
        "Image",
        [new Property("width", new NumberType(), true)],
        [],
      );
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;
      expect(rsFile.content).toContain(
        'pub unsafe extern "C" fn HybridImageSpec_get_width',
      );
      expect(rsFile.content).toContain("-> f64");
      expect(rsFile.content).toContain("obj.get_width()");
    });

    test("generates property setter shim for non-readonly", () => {
      const spec = makeSpec(
        "Image",
        [new Property("name", new StringType(), false)],
        [],
      );
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;
      expect(rsFile.content).toContain("HybridImageSpec_get_name");
      expect(rsFile.content).toContain("HybridImageSpec_set_name");
    });

    test("does not generate setter shim for readonly", () => {
      const spec = makeSpec(
        "Image",
        [new Property("width", new NumberType(), true)],
        [],
      );
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;
      expect(rsFile.content).toContain("HybridImageSpec_get_width");
      expect(rsFile.content).not.toContain("HybridImageSpec_set_width");
    });

    test("generates method shim", () => {
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
      expect(rsFile.content).toContain(
        'pub unsafe extern "C" fn HybridImageSpec_resize',
      );
      expect(rsFile.content).toContain("width: f64, height: f64");
      expect(rsFile.content).toContain("obj.resize(width, height)");
    });

    test("generates destroy shim", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;
      expect(rsFile.content).toContain(
        'pub unsafe extern "C" fn HybridImageSpec_destroy',
      );
      expect(rsFile.content).toContain("Box::from_raw");
    });
  });

  describe("C++ bridge header", () => {
    test("includes HybridImageSpec.hpp", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;
      expect(hpp.content).toContain('#include "HybridImageSpec.hpp"');
    });

    test('declares extern "C" functions', () => {
      const spec = makeSpec(
        "Image",
        [new Property("width", new NumberType(), true)],
        [],
      );
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;
      expect(hpp.content).toContain('extern "C"');
      expect(hpp.content).toContain(
        "__FfiResult_f64 HybridImageSpec_get_width(void* rustPtr)",
      );
      expect(hpp.content).toContain(
        "void HybridImageSpec_destroy(void* rustPtr)",
      );
    });

    test("inherits from HybridImageSpec", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;
      expect(hpp.content).toContain(
        "class HybridImageSpecRust: public virtual HybridImageSpec",
      );
    });

    test("has correct namespace", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;
      expect(hpp.content).toContain("namespace margelo::nitro::image");
    });

    test("has constructor taking void*", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;
      expect(hpp.content).toContain(
        "explicit HybridImageSpecRust(void* rustPtr)",
      );
    });

    test("destructor calls destroy", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;
      expect(hpp.content).toContain("~HybridImageSpecRust()");
      expect(hpp.content).toContain("HybridImageSpec_destroy(_rustPtr)");
    });

    test("generates property getter override", () => {
      const spec = makeSpec(
        "Image",
        [new Property("width", new NumberType(), true)],
        [],
      );
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;
      expect(hpp.content).toContain("double getWidth() override");
      expect(hpp.content).toContain("HybridImageSpec_get_width(_rustPtr)");
    });

    test("generates method override", () => {
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
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;
      expect(hpp.content).toContain(
        "void resize(double width, double height) override",
      );
      expect(hpp.content).toContain(
        "HybridImageSpec_resize(_rustPtr, width, height)",
      );
    });
  });

  describe("C++ bridge implementation", () => {
    test("includes the header", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const cpp = files.find((f) => f.name === "HybridImageSpecRust.cpp")!;
      expect(cpp.content).toContain('#include "HybridImageSpecRust.hpp"');
    });

    test("has correct namespace", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const cpp = files.find((f) => f.name === "HybridImageSpecRust.cpp")!;
      expect(cpp.content).toContain("namespace margelo::nitro::image");
    });
  });

  describe("complex spec with multiple members", () => {
    test("handles mix of properties and methods", () => {
      const spec = makeSpec(
        "Image",
        [
          new Property("width", new NumberType(), true),
          new Property("height", new NumberType(), true),
          new Property("label", new StringType(), false),
        ],
        [
          new Method("resize", new VoidType(), [
            new Parameter("width", new NumberType()),
            new Parameter("height", new NumberType()),
          ]),
          new Method("toArray", new ArrayType(new NumberType()), []),
          new Method("getPixel", new OptionalType(new NumberType()), [
            new Parameter("x", new NumberType()),
            new Parameter("y", new NumberType()),
          ]),
        ],
      );
      const files = createRustHybridObject(spec);

      // Trait file
      const trait = files.find((f) => f.name === "HybridImageSpec.rs")!;
      expect(trait.content).toContain("fn get_width(&self) -> f64;");
      expect(trait.content).toContain("fn get_height(&self) -> f64;");
      expect(trait.content).toContain("fn get_label(&self) -> String;");
      expect(trait.content).toContain(
        "fn set_label(&mut self, value: String);",
      );
      expect(trait.content).toContain(
        "fn resize(&mut self, width: f64, height: f64) -> Result<(), String>;",
      );
      expect(trait.content).toContain(
        "fn to_array(&mut self) -> Result<Vec<f64>, String>;",
      );
      expect(trait.content).toContain(
        "fn get_pixel(&mut self, x: f64, y: f64) -> Result<Option<f64>, String>;",
      );

      // FFI shims (in the same .rs file)
      expect(trait.content).toContain("HybridImageSpec_get_width");
      expect(trait.content).toContain("HybridImageSpec_get_height");
      expect(trait.content).toContain("HybridImageSpec_get_label");
      expect(trait.content).toContain("HybridImageSpec_set_label");
      expect(trait.content).not.toContain("HybridImageSpec_set_width");
      expect(trait.content).not.toContain("HybridImageSpec_set_height");
      expect(trait.content).toContain("HybridImageSpec_resize");
      expect(trait.content).toContain("HybridImageSpec_to_array");
      expect(trait.content).toContain("HybridImageSpec_get_pixel");
      expect(trait.content).toContain("HybridImageSpec_destroy");

      // C++ bridge
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;
      expect(hpp.content).toContain("double getWidth() override");
      expect(hpp.content).toContain("double getHeight() override");
    });
  });

  describe("FFI bridging for string types", () => {
    test("string property uses const char* at FFI boundary in C++ bridge", () => {
      const spec = makeSpec(
        "Image",
        [new Property("name", new StringType(), true)],
        [],
      );
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;

      // extern "C" should use result struct with const char* value
      expect(hpp.content).toContain(
        "__FfiResult_cstr HybridImageSpec_get_name(void* rustPtr)",
      );
      // C++ method should convert const char* back to std::string and free the Rust CString
      expect(hpp.content).toContain("std::string getName() override");
      expect(hpp.content).toContain("std::string __s(");
      expect(hpp.content).toContain("__nitrogen_free_cstring");
    });

    test("string property uses __FfiResult_cstr at FFI boundary in Rust shims", () => {
      const spec = makeSpec(
        "Image",
        [new Property("name", new StringType(), true)],
        [],
      );
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;

      // FFI shim should return __FfiResult_cstr (wrapping *const c_char)
      expect(rsFile.content).toContain("__FfiResult_cstr");
      // Should convert String to CString inside catch_unwind
      expect(rsFile.content).toContain("CString::new");
      expect(rsFile.content).toContain("into_raw");
      expect(rsFile.content).toContain("catch_unwind");
    });

    test("string method parameter uses const char* at FFI boundary", () => {
      const spec = makeSpec(
        "Image",
        [],
        [
          new Method("setName", new VoidType(), [
            new Parameter("name", new StringType()),
          ]),
        ],
      );
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;

      // FFI shim should receive *const c_char
      expect(rsFile.content).toContain("name: *const std::ffi::c_char");
      // Should convert c_char to String for the trait call
      expect(rsFile.content).toContain("CStr::from_ptr");
      expect(rsFile.content).toContain("to_string_lossy");
    });

    test("string method return uses __FfiResult_cstr at FFI boundary in C++ bridge", () => {
      const spec = makeSpec(
        "Image",
        [],
        [new Method("getName", new StringType(), [])],
      );
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;

      // extern "C" should return __FfiResult_cstr
      expect(hpp.content).toContain(
        "__FfiResult_cstr HybridImageSpec_get_name(void* rustPtr)",
      );
      // C++ method should return std::string
      expect(hpp.content).toContain("std::string getName(");
    });
  });

  describe("FFI bridging for date types", () => {
    test("date property uses double at FFI boundary", () => {
      const spec = makeSpec(
        "Image",
        [new Property("createdAt", new DateType(), true)],
        [],
      );
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;

      // extern "C" should use __FfiResult_f64 for dates
      expect(hpp.content).toContain(
        "__FfiResult_f64 HybridImageSpec_get_created_at(void* rustPtr)",
      );
    });
  });

  describe("memory size reporting", () => {
    test("Rust trait includes memory_size with default impl", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;
      expect(rsFile.content).toContain("fn memory_size(&self) -> usize { 0 }");
    });

    test("Rust FFI shim for memory_size exists", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;
      expect(rsFile.content).toContain(
        "HybridImageSpec_memory_size(ptr: *mut std::ffi::c_void) -> usize",
      );
    });

    test("C++ bridge overrides getExternalMemorySize", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;
      expect(hpp.content).toContain(
        "size_t getExternalMemorySize() noexcept override",
      );
      expect(hpp.content).toContain("HybridImageSpec_memory_size(_rustPtr)");
    });

    test("C++ bridge declares memory_size extern", () => {
      const spec = makeSpec("Image", [], []);
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;
      expect(hpp.content).toContain(
        "size_t HybridImageSpec_memory_size(void* rustPtr)",
      );
    });
  });

  describe("Promise-returning methods", () => {
    test("Rust trait returns inner type synchronously for Promise<string>", () => {
      const spec = makeSpec(
        "Image",
        [],
        [
          new Method("fetchName", new PromiseType(new StringType()), [
            new Parameter("id", new NumberType()),
          ]),
        ],
      );
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;

      // Trait should return Result<String, String>, not Promise<String>
      expect(rsFile.content).toContain(
        "fn fetch_name(&mut self, id: f64) -> Result<String, String>;",
      );
      // Should NOT reference Promise in the Rust file
      expect(rsFile.content).not.toContain("Promise");
    });

    test("Rust FFI shim returns inner FFI type for Promise<string>", () => {
      const spec = makeSpec(
        "Image",
        [],
        [new Method("fetchName", new PromiseType(new StringType()), [])],
      );
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;

      // FFI shim should return __FfiResult_cstr (inner type wrapped in result), not __FfiResult_ptr (Promise)
      expect(rsFile.content).toContain("-> __FfiResult_cstr");
      // The FFI shim function should not return __FfiResult_ptr (that would mean Promise was not unwrapped)
      expect(rsFile.content).not.toContain(
        "fn HybridImageSpec_fetch_name(ptr: *mut std::ffi::c_void) -> __FfiResult_ptr",
      );
    });

    test("C++ bridge wraps Promise<string> in Promise::async()", () => {
      const spec = makeSpec(
        "Image",
        [],
        [
          new Method("fetchName", new PromiseType(new StringType()), [
            new Parameter("id", new NumberType()),
          ]),
        ],
      );
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;

      // C++ method return type should be shared_ptr<Promise<std::string>>
      expect(hpp.content).toContain(
        "std::shared_ptr<Promise<std::string>> fetchName(",
      );
      // Should wrap in Promise::async
      expect(hpp.content).toContain("Promise<std::string>::async(");
      // extern "C" should use __FfiResult_cstr (inner type FFI result), not void*
      expect(hpp.content).toContain(
        "__FfiResult_cstr HybridImageSpec_fetch_name(void* rustPtr",
      );
    });

    test("C++ bridge wraps Promise<void> in Promise::async()", () => {
      const spec = makeSpec(
        "Image",
        [],
        [new Method("doWork", new PromiseType(new VoidType()), [])],
      );
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;

      // C++ method return type should be shared_ptr<Promise<void>>
      expect(hpp.content).toContain("std::shared_ptr<Promise<void>> doWork(");
      // Should wrap in Promise<void>::async
      expect(hpp.content).toContain("Promise<void>::async(");
      // extern "C" should return __FfiResult_void
      expect(hpp.content).toContain(
        "__FfiResult_void HybridImageSpec_do_work(void* rustPtr)",
      );
    });

    test("Rust trait returns inner type synchronously for Promise<void>", () => {
      const spec = makeSpec(
        "Image",
        [],
        [new Method("doWork", new PromiseType(new VoidType()), [])],
      );
      const files = createRustHybridObject(spec);
      const rsFile = files.find((f) => f.name === "HybridImageSpec.rs")!;

      // Trait should return Result<(), String> (void wrapped in Result)
      expect(rsFile.content).toContain(
        "fn do_work(&mut self) -> Result<(), String>;",
      );
    });

    test("C++ bridge wraps Promise<number> correctly", () => {
      const spec = makeSpec(
        "Image",
        [],
        [new Method("compute", new PromiseType(new NumberType()), [])],
      );
      const files = createRustHybridObject(spec);
      const hpp = files.find((f) => f.name === "HybridImageSpecRust.hpp")!;

      // extern "C" should return __FfiResult_f64 (not __FfiResult_ptr)
      expect(hpp.content).toContain(
        "__FfiResult_f64 HybridImageSpec_compute(void* rustPtr)",
      );
      // C++ method should wrap in Promise::async
      expect(hpp.content).toContain("Promise<double>::async(");
    });
  });

  describe("Callback (Func_*) structs", () => {
    test("Func_* struct has destroy_fn field", () => {
      const callbackType = new FunctionType(new VoidType(), [
        new NamedWrappingType("value", new NumberType()),
      ]);
      const file = createRustFunction(callbackType);
      expect(file.content).toContain(
        'destroy_fn: unsafe extern "C" fn(*mut std::ffi::c_void)',
      );
    });

    test("Func_* struct has Drop impl", () => {
      const callbackType = new FunctionType(new VoidType(), [
        new NamedWrappingType("value", new NumberType()),
      ]);
      const file = createRustFunction(callbackType);
      expect(file.content).toContain("impl Drop for");
      expect(file.content).toContain("(self.destroy_fn)(self.userdata)");
    });

    test("Func_* new() accepts destroy_fn", () => {
      const callbackType = new FunctionType(new VoidType(), [
        new NamedWrappingType("value", new NumberType()),
      ]);
      const file = createRustFunction(callbackType);
      expect(file.content).toContain("destroy_fn: unsafe extern");
      expect(file.content).toContain("Self { fn_ptr, userdata, destroy_fn }");
    });
  });
});
