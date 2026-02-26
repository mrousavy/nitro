import { describe, test, expect } from "bun:test";
import { createRustFunction } from "../syntax/rust/RustFunction.js";
import { FunctionType } from "../syntax/types/FunctionType.js";
import { NumberType } from "../syntax/types/NumberType.js";
import { StringType } from "../syntax/types/StringType.js";
import { VoidType } from "../syntax/types/VoidType.js";
import { BooleanType } from "../syntax/types/BooleanType.js";
import { NamedWrappingType } from "../syntax/types/NamedWrappingType.js";

describe("RustFunction Generator", () => {
  test("generates file with correct name based on specialization", () => {
    const funcType = new FunctionType(new VoidType(), [
      new NamedWrappingType("value", new NumberType()),
    ]);
    const file = createRustFunction(funcType);

    expect(file.name).toContain("func_");
    expect(file.name).toEndWith(".rs");
    expect(file.language).toBe("rust");
    expect(file.platform).toBe("shared");
  });

  test("generates #[repr(C)] struct", () => {
    const funcType = new FunctionType(new VoidType(), [
      new NamedWrappingType("value", new NumberType()),
    ]);
    const file = createRustFunction(funcType);

    expect(file.content).toContain("#[repr(C)]");
    expect(file.content).toContain("pub struct Func_");
  });

  test("struct has fn_ptr, userdata, and destroy_fn fields", () => {
    const funcType = new FunctionType(new VoidType(), [
      new NamedWrappingType("value", new NumberType()),
    ]);
    const file = createRustFunction(funcType);

    expect(file.content).toContain("fn_ptr:");
    expect(file.content).toContain("userdata: *mut std::ffi::c_void");
    expect(file.content).toContain(
      'destroy_fn: unsafe extern "C" fn(*mut std::ffi::c_void)',
    );
  });

  test("implements Drop to call destroy_fn", () => {
    const funcType = new FunctionType(new VoidType(), [
      new NamedWrappingType("value", new NumberType()),
    ]);
    const file = createRustFunction(funcType);

    expect(file.content).toContain("impl Drop for");
    expect(file.content).toContain("(self.destroy_fn)(self.userdata)");
  });

  test("implements Send and Sync", () => {
    const funcType = new FunctionType(new VoidType(), [
      new NamedWrappingType("value", new NumberType()),
    ]);
    const file = createRustFunction(funcType);

    expect(file.content).toContain("unsafe impl Send for");
    expect(file.content).toContain("unsafe impl Sync for");
  });

  test("has new() constructor", () => {
    const funcType = new FunctionType(new VoidType(), [
      new NamedWrappingType("value", new NumberType()),
    ]);
    const file = createRustFunction(funcType);

    expect(file.content).toContain("pub fn new(");
    expect(file.content).toContain("Self { fn_ptr, userdata, destroy_fn }");
  });

  test("has call() method with correct params for void return", () => {
    const funcType = new FunctionType(new VoidType(), [
      new NamedWrappingType("x", new NumberType()),
      new NamedWrappingType("y", new NumberType()),
    ]);
    const file = createRustFunction(funcType);

    expect(file.content).toContain("pub unsafe fn call(&self, x: f64, y: f64)");
    // Void return: no return type suffix
    expect(file.content).not.toContain("call(&self, x: f64, y: f64) ->");
  });

  test("fn_ptr signature includes userdata as first arg", () => {
    const funcType = new FunctionType(new VoidType(), [
      new NamedWrappingType("value", new NumberType()),
    ]);
    const file = createRustFunction(funcType);

    // C function pointer takes userdata first, then the actual params
    expect(file.content).toContain(
      'unsafe extern "C" fn(*mut std::ffi::c_void, f64)',
    );
  });

  test("handles string parameters with FFI conversion", () => {
    const funcType = new FunctionType(new VoidType(), [
      new NamedWrappingType("name", new StringType()),
    ]);
    const file = createRustFunction(funcType);

    // FFI type for string is *const c_char
    expect(file.content).toContain("*const std::ffi::c_char");
    // call() should accept native Rust String
    expect(file.content).toContain("name: String");
  });

  test("handles boolean parameters", () => {
    const funcType = new FunctionType(new VoidType(), [
      new NamedWrappingType("flag", new BooleanType()),
    ]);
    const file = createRustFunction(funcType);

    expect(file.content).toContain("flag: bool");
  });

  test("no-param void function generates correct signature", () => {
    const funcType = new FunctionType(new VoidType(), []);
    const file = createRustFunction(funcType);

    // Note: generated code has trailing comma/space when no params: `call(&self, )`
    expect(file.content).toContain("pub unsafe fn call(&self");
    expect(file.content).toContain("(self.fn_ptr)(self.userdata)");
  });

  test("includes auto-generated header", () => {
    const funcType = new FunctionType(new VoidType(), [
      new NamedWrappingType("value", new NumberType()),
    ]);
    const file = createRustFunction(funcType);

    expect(file.content).toContain("DO NOT MODIFY");
  });

  test("uses #![allow(...)] inner attribute", () => {
    const funcType = new FunctionType(new VoidType(), [
      new NamedWrappingType("value", new NumberType()),
    ]);
    const file = createRustFunction(funcType);

    expect(file.content).toContain("#![allow(");
  });
});
