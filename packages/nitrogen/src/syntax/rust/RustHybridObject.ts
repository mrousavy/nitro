import type { SourceFile } from "../SourceFile.js";
import {
  createFileMetadataString,
  createRustFileMetadataString,
  isNotDuplicate,
  toSnakeCase,
} from "../helpers.js";
import { indent } from "../../utils.js";
import type { HybridObjectSpec } from "../HybridObjectSpec.js";
import { includeHeader } from "../c++/includeNitroHeader.js";
import { getHybridObjectName } from "../getHybridObjectName.js";
import { RustCxxBridgedType } from "./RustCxxBridgedType.js";
import { PromiseType } from "../types/PromiseType.js";
import { getTypeAs } from "../types/getTypeAs.js";

/**
 * Creates the Rust trait definition and FFI shim functions for a HybridObject,
 * plus the C++ bridge class that calls into Rust via extern "C".
 */
export function createRustHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const files: SourceFile[] = [];

  // 1. Generate combined Rust trait + FFI shim file
  files.push(createRustTraitAndFfi(spec));

  // 2. Generate C++ bridge header (uses C-compatible types at boundary)
  files.push(createCppRustBridgeHeader(spec));

  // 3. Generate C++ bridge implementation
  files.push(createCppRustBridgeImpl(spec));

  // 4. Collect extra Rust files for referenced types (enums, structs, etc.)
  const allTypes = [
    ...spec.properties.map((p) => p.type),
    ...spec.methods.map((m) => m.returnType),
    ...spec.methods.flatMap((m) => m.parameters.map((p) => p.type)),
  ];
  for (const type of allTypes) {
    const bridged = new RustCxxBridgedType(type);
    files.push(...bridged.getExtraFiles());
  }

  return files;
}

function createRustTraitAndFfi(spec: HybridObjectSpec): SourceFile {
  const name = getHybridObjectName(spec.name);

  const shims: string[] = [];

  // Helper: generate a catch_unwind-wrapped FFI shim that returns __FfiResult_*.
  // Helper to convert a Rust error string to a C string for FFI.
  const errToCString = `{ let __s = __err.replace('\\0', ""); std::ffi::CString::new(__s).unwrap_or_default().into_raw() }`;

  function wrapCatchUnwind(
    funcName: string,
    params: string,
    resultType: string,
    isVoid: boolean,
    closureBody: string,
    returnsResult: boolean = false,
  ): string {
    const note = `// NOTE: AssertUnwindSafe is used because UnwindSafe cannot be required on the trait
    // without making it viral across all implementations. If a panic occurs mid-mutation,
    // the object's internal state may be inconsistent on subsequent calls.`;

    if (isVoid && returnsResult) {
      // Method returning Result<(), String>
      return `
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ${funcName}(${params}) -> ${resultType} {
    ${note}
    unsafe {
        match std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
${closureBody}
        })) {
            Ok(Ok(_)) => ${resultType} { is_ok: 1, error: std::ptr::null_mut() },
            Ok(Err(__err)) => ${resultType} { is_ok: 0, error: ${errToCString} },
            Err(__panic) => ${resultType} { is_ok: 0, error: crate::__nitro_panic_to_cstring(__panic) },
        }
    }
}
      `.trim();
    } else if (isVoid) {
      // Property setter or void return without Result
      return `
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ${funcName}(${params}) -> ${resultType} {
    ${note}
    unsafe {
        match std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
${closureBody}
        })) {
            Ok(_) => ${resultType} { is_ok: 1, error: std::ptr::null_mut() },
            Err(__panic) => ${resultType} { is_ok: 0, error: crate::__nitro_panic_to_cstring(__panic) },
        }
    }
}
      `.trim();
    } else if (returnsResult) {
      // Method returning Result<T, String>
      return `
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ${funcName}(${params}) -> ${resultType} {
    ${note}
    unsafe {
        match std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
${closureBody}
        })) {
            Ok(Ok(__value)) => ${resultType} { is_ok: 1, error: std::ptr::null_mut(), value: __value },
            Ok(Err(__err)) => ${resultType} { is_ok: 0, error: ${errToCString}, value: std::mem::zeroed() },
            // SAFETY: value is intentionally zeroed on error — C++ checks is_ok before reading it.
            Err(__panic) => ${resultType} { is_ok: 0, error: crate::__nitro_panic_to_cstring(__panic), value: std::mem::zeroed() },
        }
    }
}
      `.trim();
    } else {
      // Property getter returning bare value
      return `
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ${funcName}(${params}) -> ${resultType} {
    ${note}
    unsafe {
        match std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
${closureBody}
        })) {
            Ok(__result) => ${resultType} { is_ok: 1, error: std::ptr::null_mut(), value: __result },
            // SAFETY: value is intentionally zeroed on error — C++ checks is_ok before reading it.
            Err(__panic) => ${resultType} { is_ok: 0, error: crate::__nitro_panic_to_cstring(__panic), value: std::mem::zeroed() },
        }
    }
}
      `.trim();
    }
  }

  // Property getter/setter shims
  for (const prop of spec.properties) {
    const rustPropName = toSnakeCase(prop.name);
    const bridgedType = new RustCxxBridgedType(prop.type);
    const resultType = bridgedType.getRustFfiResultType();
    const isVoidReturn = bridgedType.getRustFfiType() === "()";

    if (bridgedType.needsSpecialHandling) {
      const traitCall = `obj.${rustPropName}()`;
      const convertedReturn = bridgedType.parseFromRustToCpp(traitCall, "rust");
      shims.push(
        wrapCatchUnwind(
          `${name.HybridTSpec}_get_${rustPropName}`,
          `ptr: *mut std::ffi::c_void`,
          resultType,
          isVoidReturn,
          `            let obj = &*(ptr as *mut Box<dyn ${name.HybridTSpec}>);\n            ${convertedReturn}`,
        ),
      );
    } else {
      shims.push(
        wrapCatchUnwind(
          `${name.HybridTSpec}_get_${rustPropName}`,
          `ptr: *mut std::ffi::c_void`,
          resultType,
          isVoidReturn,
          `            let obj = &*(ptr as *mut Box<dyn ${name.HybridTSpec}>);\n            obj.${rustPropName}()`,
        ),
      );
    }

    // Setter (if not readonly)
    if (!prop.isReadonly) {
      const ffiParamType = bridgedType.getRustFfiType();
      if (bridgedType.needsSpecialHandling) {
        const convertedParam = bridgedType.parseFromCppToRust("value", "rust");
        shims.push(
          wrapCatchUnwind(
            `${name.HybridTSpec}_set_${rustPropName}`,
            `ptr: *mut std::ffi::c_void, value: ${ffiParamType}`,
            "__FfiResult_void",
            true,
            `            let obj = &mut *(ptr as *mut Box<dyn ${name.HybridTSpec}>);\n            obj.set_${rustPropName}(${convertedParam});`,
          ),
        );
      } else {
        shims.push(
          wrapCatchUnwind(
            `${name.HybridTSpec}_set_${rustPropName}`,
            `ptr: *mut std::ffi::c_void, value: ${ffiParamType}`,
            "__FfiResult_void",
            true,
            `            let obj = &mut *(ptr as *mut Box<dyn ${name.HybridTSpec}>);\n            obj.set_${rustPropName}(value);`,
          ),
        );
      }
    }
  }

  // Method shims
  for (const method of spec.methods) {
    const rustMethodName = toSnakeCase(method.name);
    // For Promise-returning methods, the Rust side returns the inner type synchronously.
    // The C++ bridge wraps the call in Promise<T>::async().
    const effectiveReturnType =
      method.returnType.kind === "promise"
        ? getTypeAs(method.returnType, PromiseType).resultingType
        : method.returnType;
    const returnBridged = new RustCxxBridgedType(effectiveReturnType);
    const resultType = returnBridged.getRustFfiResultType();
    const isVoidReturn = returnBridged.getRustFfiType() === "()";

    // Build FFI params with C-compatible types (skip void/null params)
    const validMethodParams = method.parameters.filter(
      (p) => p.type.kind !== "void" && p.type.kind !== "null",
    );
    const ffiParams = validMethodParams.map((p) => {
      const bridged = new RustCxxBridgedType(p.type);
      return `${toSnakeCase(p.name)}: ${bridged.getRustFfiType()}`;
    });
    const ffiParamsList = [
      `ptr: *mut std::ffi::c_void`,
      ...ffiParams,
    ].join(", ");

    // Build conversion code for parameters and return value
    const paramConversions: string[] = [];
    const traitCallArgs: string[] = [];

    for (const p of validMethodParams) {
      const pName = toSnakeCase(p.name);
      const bridged = new RustCxxBridgedType(p.type);
      if (bridged.needsSpecialHandling) {
        const convertedName = `__${pName}`;
        const conversion = bridged.parseFromCppToRust(pName, "rust");
        paramConversions.push(`let ${convertedName} = ${conversion};`);
        traitCallArgs.push(convertedName);
      } else {
        traitCallArgs.push(pName);
      }
    }

    const traitCall = `obj.${rustMethodName}(${traitCallArgs.join(", ")})`;

    // Method returns Result<T, String>. The closure must return Result<FfiT, String>
    // so wrapCatchUnwind can three-way match on Ok(Ok(v)) / Ok(Err(e)) / Err(panic).
    const closureLines: string[] = [];
    closureLines.push(
      `            let obj = &mut *(ptr as *mut Box<dyn ${name.HybridTSpec}>);`,
    );
    for (const conv of paramConversions) {
      closureLines.push(`            ${conv}`);
    }
    if (returnBridged.needsSpecialHandling) {
      // Convert the inner value from Rust type to FFI type, preserving the Result wrapper
      const converted = returnBridged.parseFromRustToCpp("__value", "rust");
      closureLines.push(
        `            ${traitCall}.map(|__value| ${converted})`,
      );
    } else {
      // Bare type or void — Result passes through directly
      closureLines.push(`            ${traitCall}`);
    }

    shims.push(
      wrapCatchUnwind(
        `${name.HybridTSpec}_${rustMethodName}`,
        ffiParamsList,
        resultType,
        isVoidReturn,
        closureLines.join("\n"),
        true, // methods return Result<T, String>
      ),
    );
  }

  // Memory size shim (for GC pressure reporting) — NOT wrapped in catch_unwind
  shims.push(
    `
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ${name.HybridTSpec}_memory_size(ptr: *mut std::ffi::c_void) -> usize {
    unsafe {
        let obj = &*(ptr as *mut Box<dyn ${name.HybridTSpec}>);
        obj.memory_size()
    }
}
  `.trim(),
  );

  // Destroy shim (for C++ destructor to call) — NOT wrapped in catch_unwind
  shims.push(
    `
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ${name.HybridTSpec}_destroy(ptr: *mut std::ffi::c_void) {
    unsafe {
        let _ = Box::from_raw(ptr as *mut Box<dyn ${name.HybridTSpec}>);
    }
}
  `.trim(),
  );

  // Note: __nitrogen_free_cstring is emitted once in lib.rs (via createRustLibRs)
  // to avoid duplicate symbol errors when multiple HybridObjects exist.

  // Collect Rust use imports from all property/method types
  const rustImports = [
    ...spec.properties.flatMap((p) => p.getRequiredImports("rust")),
    ...spec.methods.flatMap((m) => m.getRequiredImports("rust")),
  ]
    .filter((i) => i.language === "rust")
    .filter((i) => !i.name.endsWith(`::${name.HybridTSpec}`))
    .map((i) => `use ${i.name};`)
    .filter(isNotDuplicate);
  // Always import crate-level FFI result types and helpers
  rustImports.unshift("use crate::*;");
  const importsBlock = "\n" + rustImports.join("\n") + "\n";

  // Generate trait definition
  const properties = spec.properties.map((p) => p.getCode("rust")).join("\n");
  const methods = spec.methods.map((m) => m.getCode("rust")).join("\n");

  const moduleName = toSnakeCase(name.HybridTSpec);

  const code = `
${createRustFileMetadataString(`${moduleName}.rs`)}
${importsBlock}
/// Implement this trait to create a Rust-backed HybridObject for \`${spec.name}\`.
///
/// After implementing, provide a factory function for registration:
/// \`\`\`rust
/// #[unsafe(no_mangle)]
/// pub extern "C" fn create_${name.HybridTSpec}() -> *mut std::ffi::c_void {
///     let obj: Box<dyn ${name.HybridTSpec}> = Box::new(My${spec.name}::new());
///     Box::into_raw(Box::new(obj)) as *mut std::ffi::c_void
/// }
/// \`\`\`
///
/// Note: The factory returns a \`Box<Box<dyn ${name.HybridTSpec}>>\` (double-boxed)
/// because the C++ bridge stores it as an opaque \`void*\` pointing to the trait object.
pub trait ${name.HybridTSpec}: Send + Sync {
    // Properties
    ${indent(properties, "    ")}

    // Methods
    ${indent(methods, "    ")}

    /// Return the size of any external heap allocations, in bytes.
    /// This is used to inform the JavaScript GC about native memory pressure.
    fn memory_size(&self) -> usize { 0 }
}

// FFI shims for C++ bridge

${shims.join("\n\n")}
  `.trim();

  return {
    content: code,
    name: `${moduleName}.rs`,
    subdirectory: [],
    language: "rust",
    platform: "shared",
  };
}

function createCppRustBridgeHeader(spec: HybridObjectSpec): SourceFile {
  const name = getHybridObjectName(spec.name);
  const cxxNamespace = spec.config.getCxxNamespace("c++");

  // Collect which result struct types are needed
  const usedResultTypes = new Set<string>();

  // extern "C" declarations using result struct return types
  const externDecls: string[] = [];

  for (const prop of spec.properties) {
    const rustPropName = toSnakeCase(prop.name);
    const bridged = new RustCxxBridgedType(prop.type);
    const resultType = bridged.getCppFfiResultType();
    usedResultTypes.add(resultType);

    externDecls.push(
      `${resultType} ${name.HybridTSpec}_get_${rustPropName}(void* rustPtr);`,
    );
    if (!prop.isReadonly) {
      usedResultTypes.add("__FfiResult_void");
      if (bridged.hasType) {
        externDecls.push(
          `__FfiResult_void ${name.HybridTSpec}_set_${rustPropName}(void* rustPtr, ${bridged.getCppFfiType()} value);`,
        );
      } else {
        // void/null types have no value parameter
        externDecls.push(
          `__FfiResult_void ${name.HybridTSpec}_set_${rustPropName}(void* rustPtr);`,
        );
      }
    }
  }

  for (const method of spec.methods) {
    const rustMethodName = toSnakeCase(method.name);
    const effectiveReturnType =
      method.returnType.kind === "promise"
        ? getTypeAs(method.returnType, PromiseType).resultingType
        : method.returnType;
    const returnBridged = new RustCxxBridgedType(effectiveReturnType);
    const resultType = returnBridged.getCppFfiResultType();
    usedResultTypes.add(resultType);

    const params = method.parameters
      .filter((p) => p.type.kind !== "void" && p.type.kind !== "null")
      .map((p) => {
        const bridged = new RustCxxBridgedType(p.type);
        return `${bridged.getCppFfiType()} ${p.name}`;
      })
      .join(", ");
    const paramsWithComma = params.length > 0 ? `, ${params}` : "";
    externDecls.push(
      `${resultType} ${name.HybridTSpec}_${rustMethodName}(void* rustPtr${paramsWithComma});`,
    );
  }

  externDecls.push(`size_t ${name.HybridTSpec}_memory_size(void* rustPtr);`);
  externDecls.push(`void ${name.HybridTSpec}_destroy(void* rustPtr);`);
  externDecls.push(`void __nitrogen_free_cstring(char* ptr);`);

  // Generate C++ result struct definitions matching Rust #[repr(C)] layout
  const cppResultStructDefs: string[] = [];
  const cppFfiTypeMap: Record<string, string> = {
    __FfiResult_void: "",
    __FfiResult_f64: "double value;",
    __FfiResult_bool: "bool value;",
    __FfiResult_i32: "int32_t value;",
    __FfiResult_i64: "int64_t value;",
    __FfiResult_u64: "uint64_t value;",
    __FfiResult_usize: "size_t value;",
    __FfiResult_cstr: "const char* value;",
    __FfiResult_ptr: "void* value;",
  };
  for (const resultType of [...usedResultTypes].sort()) {
    const valueField = cppFfiTypeMap[resultType] ?? "void* value;";
    if (resultType === "__FfiResult_void") {
      cppResultStructDefs.push(
        `struct ${resultType} { uint8_t is_ok; char* error; };`,
      );
    } else {
      cppResultStructDefs.push(
        `struct ${resultType} { uint8_t is_ok; char* error; ${valueField} };`,
      );
    }
  }

  // Property implementations with error checking
  const propertyImpls: string[] = [];
  for (const prop of spec.properties) {
    const rustPropName = toSnakeCase(prop.name);
    const cppType = prop.type.getCode("c++");
    const getterName = prop.getGetterName("other");
    const bridged = new RustCxxBridgedType(prop.type);

    const ffiCall = `${name.HybridTSpec}_get_${rustPropName}(_rustPtr)`;
    if (!bridged.hasType) {
      // void/null property — no value to return
      propertyImpls.push(
        `inline ${cppType} ${getterName}() override { auto __ffi = ${ffiCall}; if (!__ffi.is_ok) { __throwRustError(__ffi.error); } }`,
      );
    } else if (bridged.needsSpecialHandling) {
      const converted = bridged.parseFromRustToCpp("__ffi.value", "c++");
      propertyImpls.push(
        `inline ${cppType} ${getterName}() override { auto __ffi = ${ffiCall}; if (!__ffi.is_ok) { __throwRustError(__ffi.error); } return ${converted}; }`,
      );
    } else {
      propertyImpls.push(
        `inline ${cppType} ${getterName}() override { auto __ffi = ${ffiCall}; if (!__ffi.is_ok) { __throwRustError(__ffi.error); } return __ffi.value; }`,
      );
    }

    if (!prop.isReadonly) {
      const setterName = prop.getSetterName("other");
      const paramType = prop.type.canBePassedByReference
        ? `const ${cppType}&`
        : cppType;
      if (!bridged.hasType) {
        // void/null property — no value parameter
        propertyImpls.push(
          `inline void ${setterName}(${paramType} ${prop.name}) override { auto __ffi = ${name.HybridTSpec}_set_${rustPropName}(_rustPtr); if (!__ffi.is_ok) { __throwRustError(__ffi.error); } }`,
        );
      } else if (bridged.needsSpecialHandling) {
        const converted = bridged.parseFromCppToRust(prop.name, "c++");
        propertyImpls.push(
          `inline void ${setterName}(${paramType} ${prop.name}) override { auto __ffi = ${name.HybridTSpec}_set_${rustPropName}(_rustPtr, ${converted}); if (!__ffi.is_ok) { __throwRustError(__ffi.error); } }`,
        );
      } else {
        propertyImpls.push(
          `inline void ${setterName}(${paramType} ${prop.name}) override { auto __ffi = ${name.HybridTSpec}_set_${rustPropName}(_rustPtr, ${prop.name}); if (!__ffi.is_ok) { __throwRustError(__ffi.error); } }`,
        );
      }
    }
  }

  // Method implementations with error checking
  const methodImpls: string[] = [];
  for (const method of spec.methods) {
    const rustMethodName = toSnakeCase(method.name);
    const returnType = method.returnType.getCode("c++");
    const isPromise = method.returnType.kind === "promise";

    const effectiveReturnType = isPromise
      ? getTypeAs(method.returnType, PromiseType).resultingType
      : method.returnType;
    const returnBridged = new RustCxxBridgedType(effectiveReturnType);
    const hasReturn = effectiveReturnType.kind !== "void";

    const validParams = method.parameters.filter(
      (p) => p.type.kind !== "void" && p.type.kind !== "null",
    );
    const params = validParams
      .map((p) => {
        const t = p.type.getCode("c++");
        return p.type.canBePassedByReference
          ? `const ${t}& ${p.name}`
          : `${t} ${p.name}`;
      })
      .join(", ");

    const ffiArgs = validParams.map((p) => {
      const bridged = new RustCxxBridgedType(p.type);
      if (bridged.needsSpecialHandling) {
        return bridged.parseFromCppToRust(p.name, "c++");
      }
      return p.name;
    });
    const ffiArgsWithComma =
      ffiArgs.length > 0 ? `, ${ffiArgs.join(", ")}` : "";

    const ffiCall = `${name.HybridTSpec}_${rustMethodName}(_rustPtr${ffiArgsWithComma})`;

    if (isPromise) {
      const innerCppType = effectiveReturnType.getCode("c++");
      if (hasReturn) {
        if (returnBridged.needsSpecialHandling) {
          const converted = returnBridged.parseFromRustToCpp("__ffi.value", "c++");
          methodImpls.push(
            `inline ${returnType} ${method.name}(${params}) override {\n` +
              `      return Promise<${innerCppType}>::async([=]() -> ${innerCppType} {\n` +
              `        auto __ffi = ${ffiCall};\n` +
              `        if (!__ffi.is_ok) { __throwRustError(__ffi.error); }\n` +
              `        return ${converted};\n` +
              `      });\n` +
              `    }`,
          );
        } else {
          methodImpls.push(
            `inline ${returnType} ${method.name}(${params}) override {\n` +
              `      return Promise<${innerCppType}>::async([=]() -> ${innerCppType} {\n` +
              `        auto __ffi = ${ffiCall};\n` +
              `        if (!__ffi.is_ok) { __throwRustError(__ffi.error); }\n` +
              `        return __ffi.value;\n` +
              `      });\n` +
              `    }`,
          );
        }
      } else {
        // Promise<void>
        methodImpls.push(
          `inline ${returnType} ${method.name}(${params}) override {\n` +
            `      return Promise<void>::async([=]() {\n` +
            `        auto __ffi = ${ffiCall};\n` +
            `        if (!__ffi.is_ok) { __throwRustError(__ffi.error); }\n` +
            `      });\n` +
            `    }`,
        );
      }
    } else if (hasReturn && returnBridged.needsSpecialHandling) {
      const converted = returnBridged.parseFromRustToCpp("__ffi.value", "c++");
      methodImpls.push(
        `inline ${returnType} ${method.name}(${params}) override { auto __ffi = ${ffiCall}; if (!__ffi.is_ok) { __throwRustError(__ffi.error); } return ${converted}; }`,
      );
    } else if (hasReturn) {
      methodImpls.push(
        `inline ${returnType} ${method.name}(${params}) override { auto __ffi = ${ffiCall}; if (!__ffi.is_ok) { __throwRustError(__ffi.error); } return __ffi.value; }`,
      );
    } else {
      methodImpls.push(
        `inline void ${method.name}(${params}) override { auto __ffi = ${ffiCall}; if (!__ffi.is_ok) { __throwRustError(__ffi.error); } }`,
      );
    }
  }

  // Extra includes for types used in the interface
  const extraIncludes = [
    ...spec.properties.flatMap((p) => p.getRequiredImports("c++")),
    ...spec.methods.flatMap((m) => m.getRequiredImports("c++")),
  ];
  const cppExtraIncludes = extraIncludes
    .map((i) => includeHeader(i))
    .filter(isNotDuplicate);

  const headerCode = `
${createFileMetadataString(`${name.HybridTSpecRust}.hpp`)}

#pragma once

#include <cstdio>
#include <cstdlib>
#include <stdexcept>
#include "${name.HybridTSpec}.hpp"

${cppExtraIncludes.join("\n")}

// FFI result structs for error propagation from Rust
${cppResultStructDefs.join("\n")}

// Forward declarations for Rust FFI functions
extern "C" {
  ${indent(externDecls.join("\n"), "  ")}
}

namespace ${cxxNamespace} {

  /**
   * C++ bridge class that forwards HybridObject calls to a Rust implementation via extern "C" FFI.
   */
  class ${name.HybridTSpecRust}: public virtual ${name.HybridTSpec} {
  public:
    explicit ${name.HybridTSpecRust}(void* rustPtr):
      HybridObject(${name.HybridTSpec}::TAG),
      _rustPtr(rustPtr) { }

    ~${name.HybridTSpecRust}() override {
      ${name.HybridTSpec}_destroy(_rustPtr);
    }

  public:
    // Properties
    ${indent(propertyImpls.join("\n"), "    ")}

  public:
    // Methods
    ${indent(methodImpls.join("\n"), "    ")}

  public:
    inline size_t getExternalMemorySize() noexcept override {
      return ${name.HybridTSpec}_memory_size(_rustPtr);
    }

  private:
    [[noreturn]] static void __throwRustError(char* error) {
      std::string msg(error);
      __nitrogen_free_cstring(error);
      throw std::runtime_error(msg);
    }

  private:
    void* _rustPtr;
  };

} // namespace ${cxxNamespace}
  `.trim();

  return {
    content: headerCode,
    name: `${name.HybridTSpecRust}.hpp`,
    subdirectory: [],
    language: "c++",
    platform: "shared",
  };
}

function createCppRustBridgeImpl(spec: HybridObjectSpec): SourceFile {
  const name = getHybridObjectName(spec.name);
  const cxxNamespace = spec.config.getCxxNamespace("c++");

  const implCode = `
${createFileMetadataString(`${name.HybridTSpecRust}.cpp`)}

#include "${name.HybridTSpecRust}.hpp"

namespace ${cxxNamespace} {
} // namespace ${cxxNamespace}
  `.trim();

  return {
    content: implCode,
    name: `${name.HybridTSpecRust}.cpp`,
    subdirectory: [],
    language: "c++",
    platform: "shared",
  };
}
