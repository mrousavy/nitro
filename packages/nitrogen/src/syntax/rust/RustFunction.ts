import type { SourceFile } from "../SourceFile.js";
import { createRustFileMetadataString, isNotDuplicate, toSnakeCase } from "../helpers.js";
import type { FunctionType } from "../types/FunctionType.js";
import { getTypeAs } from "../types/getTypeAs.js";
import { PromiseType } from "../types/PromiseType.js";
import type { Type } from "../types/Type.js";
import { RustCxxBridgedType } from "./RustCxxBridgedType.js";

/**
 * Creates a Rust type alias and FFI wrapper for a callback/function type.
 *
 * At the FFI boundary, callbacks are passed as a C function pointer + userdata pointer.
 * The Rust side wraps this into a safe closure.
 *
 * C++ side: `void(*callback)(void* userdata, Args...)` + `void* userdata`
 * Rust side: `Box<dyn Fn(Args...) -> ReturnType>`
 */
export function createRustFunction(funcType: FunctionType): SourceFile {
  const name = funcType.specializationName;

  // FFI parameter types (C-compatible)
  const ffiParams = funcType.parameters.map((p) => {
    const bridged = new RustCxxBridgedType(p);
    return bridged.getRustFfiType();
  });

  // FFI return type — for Promise returns, use the innermost non-Promise
  // type's FFI representation because the C++ trampoline awaits all Promise
  // layers before returning the resolved value.
  let effectiveReturnType: Type = funcType.returnType;
  if (funcType.returnType.kind === "promise") {
    while (effectiveReturnType.kind === "promise") {
      effectiveReturnType = getTypeAs(effectiveReturnType, PromiseType).resultingType;
    }
  }
  const effectiveReturnBridged = new RustCxxBridgedType(effectiveReturnType);
  const isPromiseReturn = funcType.returnType.kind === "promise";

  // For Promise-returning callbacks, use a result struct as the FFI return type
  // so that Promise rejection errors can be propagated instead of aborting.
  let ffiReturnType: string;
  let ffiReturnSuffix: string;
  if (isPromiseReturn) {
    const resultStructType = effectiveReturnBridged.getRustFfiResultType();
    ffiReturnType = `crate::${resultStructType}`;
    ffiReturnSuffix = ` -> ${ffiReturnType}`;
  } else {
    ffiReturnType = effectiveReturnBridged.getRustFfiType();
    ffiReturnSuffix = ffiReturnType === "()" ? "" : ` -> ${ffiReturnType}`;
  }

  // The C function pointer type: fn(userdata, args...) -> ret
  const ffiParamsWithUserdata = ["*mut std::ffi::c_void", ...ffiParams].join(
    ", ",
  );
  const cFnType = `unsafe extern "C" fn(${ffiParamsWithUserdata})${ffiReturnSuffix}`;

  // Native Rust parameter types
  const rustParams = funcType.parameters.map((p) => p.getCode("rust"));

  // For Promise-returning callbacks, call() returns Result<T, String>
  let rustReturnSuffix: string;
  if (isPromiseReturn) {
    const innerRustType = effectiveReturnType.getCode("rust");
    rustReturnSuffix =
      innerRustType === "()"
        ? ` -> Result<(), String>`
        : ` -> Result<${innerRustType}, String>`;
  } else {
    const rustReturnType = funcType.returnType.getCode("rust");
    rustReturnSuffix =
      rustReturnType === "()" ? "" : ` -> ${rustReturnType}`;
  }

  // Build the wrapper struct
  const wrapperFields =
    `    fn_ptr: ${cFnType},\n` +
    `    userdata: *mut std::ffi::c_void,\n` +
    `    destroy_fn: unsafe extern "C" fn(*mut std::ffi::c_void),`;

  // Build the call() implementation
  const callFfiArgs = funcType.parameters.map((p) => {
    const bridged = new RustCxxBridgedType(p);
    const argName = p.escapedName;
    if (bridged.needsSpecialHandling) {
      return bridged.parseFromRustToCpp(argName, "rust");
    }
    return argName;
  });
  const ffiCallArgs = ["self.userdata", ...callFfiArgs].join(", ");

  let callBody: string;
  if (isPromiseReturn) {
    // Promise-returning callback: FFI returns a result struct.
    // Parse it into Result<T, String>.
    const innerRustType = effectiveReturnType.getCode("rust");
    const errorParsing =
      `let msg = if __ffi_result.error.is_null() { "unknown callback error".to_string() } ` +
      `else { let s = std::ffi::CStr::from_ptr(__ffi_result.error).to_string_lossy().into_owned(); ` +
      `crate::__nitrogen_free_cstring(__ffi_result.error); s }; Err(msg)`;
    if (innerRustType === "()") {
      callBody =
        `        unsafe {\n` +
        `            let __ffi_result = (self.fn_ptr)(${ffiCallArgs});\n` +
        `            if __ffi_result.is_ok != 0 { Ok(()) } else { ${errorParsing} }\n` +
        `        }`;
    } else if (effectiveReturnBridged.needsSpecialHandling) {
      const resultConversion = effectiveReturnBridged.parseFromCppToRust(
        "__ffi_result.value",
        "rust",
      );
      callBody =
        `        unsafe {\n` +
        `            let __ffi_result = (self.fn_ptr)(${ffiCallArgs});\n` +
        `            if __ffi_result.is_ok != 0 { Ok(${resultConversion}) } else { ${errorParsing} }\n` +
        `        }`;
    } else {
      callBody =
        `        unsafe {\n` +
        `            let __ffi_result = (self.fn_ptr)(${ffiCallArgs});\n` +
        `            if __ffi_result.is_ok != 0 { Ok(__ffi_result.value) } else { ${errorParsing} }\n` +
        `        }`;
    }
  } else if (effectiveReturnBridged.needsSpecialHandling) {
    const resultConversion = effectiveReturnBridged.parseFromCppToRust(
      "__result",
      "rust",
    );
    callBody = `        unsafe {\n            let __result = (self.fn_ptr)(${ffiCallArgs});\n            ${resultConversion}\n        }`;
  } else {
    const rustReturnType = funcType.returnType.getCode("rust");
    if (rustReturnType === "()") {
      callBody = `        unsafe { (self.fn_ptr)(${ffiCallArgs}); }`;
    } else {
      callBody = `        unsafe { (self.fn_ptr)(${ffiCallArgs}) }`;
    }
  }

  const callParams = funcType.parameters
    .map((p, i) => `${p.escapedName}: ${rustParams[i]}`)
    .join(", ");

  // Collect use imports from parameter/return types
  const rustImports = [
    ...funcType.parameters.flatMap((p) => p.getRequiredImports("rust")),
    ...funcType.returnType.getRequiredImports("rust"),
  ]
    .filter((i) => i.language === "rust")
    .map((i) => `use ${i.name};`)
    .filter(isNotDuplicate);
  const importsBlock =
    rustImports.length > 0 ? rustImports.join("\n") + "\n" : "";

  const moduleName = toSnakeCase(name);

  const code = `
${createRustFileMetadataString(`${moduleName}.rs`)}

use std::ffi;
${importsBlock}
/// FFI-safe wrapper for callback \`${name}\`.
///
/// Wraps a C function pointer + userdata into a callable Rust struct.
/// The C++ side passes a function pointer and opaque userdata;
/// the Rust side can call it safely through this wrapper.
#[repr(C)]
pub struct ${name} {
${wrapperFields}
}

// Safety: The C++ side guarantees the function pointer and userdata
// are valid for the lifetime of this struct and are thread-safe.
unsafe impl Send for ${name} {}
unsafe impl Sync for ${name} {}

impl ${name} {
    /// Create a new wrapper from a C function pointer, userdata, and destroy function.
    pub fn new(fn_ptr: ${cFnType}, userdata: *mut ffi::c_void, destroy_fn: unsafe extern "C" fn(*mut ffi::c_void)) -> Self {
        Self { fn_ptr, userdata, destroy_fn }
    }

    /// Call the wrapped function.
    pub unsafe fn call(&self, ${callParams})${rustReturnSuffix} {
${callBody}
    }
}

impl Drop for ${name} {
    fn drop(&mut self) {
        unsafe { (self.destroy_fn)(self.userdata); }
    }
}
`.trim();

  return {
    content: code,
    name: `${moduleName}.rs`,
    subdirectory: [],
    language: "rust",
    platform: "shared",
  };
}
