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

  // Property getter/setter shims
  for (const prop of spec.properties) {
    const rustPropName = toSnakeCase(prop.name);
    const bridgedType = new RustCxxBridgedType(prop.type);
    const ffiReturnType = bridgedType.getRustFfiType();
    const ffiReturnSuffix =
      ffiReturnType === "()" ? "" : ` -> ${ffiReturnType}`;

    if (bridgedType.needsSpecialHandling) {
      // Type needs conversion at FFI boundary
      const traitCall = `obj.get_${rustPropName}()`;
      const convertedReturn = bridgedType.parseFromRustToCpp(traitCall, "rust");
      shims.push(
        `
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ${name.HybridTSpec}_get_${rustPropName}(ptr: *mut std::ffi::c_void)${ffiReturnSuffix} {
    unsafe {
        let obj = &*(ptr as *mut Box<dyn ${name.HybridTSpec}>);
        ${convertedReturn}
    }
}
    `.trim(),
      );
    } else {
      // Primitive: pass through directly
      shims.push(
        `
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ${name.HybridTSpec}_get_${rustPropName}(ptr: *mut std::ffi::c_void)${ffiReturnSuffix} {
    unsafe {
        let obj = &*(ptr as *mut Box<dyn ${name.HybridTSpec}>);
        obj.get_${rustPropName}()
    }
}
    `.trim(),
      );
    }

    // Setter (if not readonly)
    if (!prop.isReadonly) {
      if (bridgedType.needsSpecialHandling) {
        const convertedParam = bridgedType.parseFromCppToRust("value", "rust");
        shims.push(
          `
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ${name.HybridTSpec}_set_${rustPropName}(ptr: *mut std::ffi::c_void, value: ${ffiReturnType}) {
    unsafe {
        let obj = &mut *(ptr as *mut Box<dyn ${name.HybridTSpec}>);
        obj.set_${rustPropName}(${convertedParam});
    }
}
      `.trim(),
        );
      } else {
        shims.push(
          `
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ${name.HybridTSpec}_set_${rustPropName}(ptr: *mut std::ffi::c_void, value: ${ffiReturnType}) {
    unsafe {
        let obj = &mut *(ptr as *mut Box<dyn ${name.HybridTSpec}>);
        obj.set_${rustPropName}(value);
    }
}
      `.trim(),
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
    const ffiReturnType = returnBridged.getRustFfiType();
    const ffiReturnSuffix =
      ffiReturnType === "()" ? "" : ` -> ${ffiReturnType}`;

    // Build FFI params with C-compatible types (skip void/null params)
    const validMethodParams = method.parameters.filter(
      (p) => p.type.kind !== "void" && p.type.kind !== "null",
    );
    const ffiParams = validMethodParams.map((p) => {
      const bridged = new RustCxxBridgedType(p.type);
      return `${toSnakeCase(p.name)}: ${bridged.getRustFfiType()}`;
    });
    const ffiParamsWithComma =
      ffiParams.length > 0 ? `, ${ffiParams.join(", ")}` : "";

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

    let body: string;
    if (paramConversions.length === 0 && !returnBridged.needsSpecialHandling) {
      // Simple case: no conversions needed
      body = `    unsafe {\n        let obj = &mut *(ptr as *mut Box<dyn ${name.HybridTSpec}>);\n        ${traitCall}\n    }`;
    } else {
      const lines: string[] = [];
      lines.push(
        `        let obj = &mut *(ptr as *mut Box<dyn ${name.HybridTSpec}>);`,
      );
      for (const conv of paramConversions) {
        lines.push(`        ${conv}`);
      }
      if (returnBridged.needsSpecialHandling) {
        lines.push(`        let __result = ${traitCall};`);
        lines.push(
          `        ${returnBridged.parseFromRustToCpp("__result", "rust")}`,
        );
      } else {
        lines.push(`        ${traitCall}`);
      }
      body = `    unsafe {\n${lines.join("\n")}\n    }`;
    }

    shims.push(
      `
#[unsafe(no_mangle)]
pub unsafe extern "C" fn ${name.HybridTSpec}_${rustMethodName}(ptr: *mut std::ffi::c_void${ffiParamsWithComma})${ffiReturnSuffix} {
${body}
}
    `.trim(),
    );
  }

  // Memory size shim (for GC pressure reporting)
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

  // Destroy shim (for C++ destructor to call)
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
  const importsBlock =
    rustImports.length > 0 ? "\n" + rustImports.join("\n") + "\n" : "";

  // Generate trait definition
  const properties = spec.properties.map((p) => p.getCode("rust")).join("\n");
  const methods = spec.methods.map((m) => m.getCode("rust")).join("\n");

  const code = `
${createRustFileMetadataString(`${name.HybridTSpec}.rs`)}
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
    name: `${name.HybridTSpec}.rs`,
    subdirectory: [],
    language: "rust",
    platform: "shared",
  };
}

function createCppRustBridgeHeader(spec: HybridObjectSpec): SourceFile {
  const name = getHybridObjectName(spec.name);
  const cxxNamespace = spec.config.getCxxNamespace("c++");

  // extern "C" declarations using C-compatible FFI types
  const externDecls: string[] = [];

  for (const prop of spec.properties) {
    const rustPropName = toSnakeCase(prop.name);
    const bridged = new RustCxxBridgedType(prop.type);
    const ffiType = bridged.getCppFfiType();

    externDecls.push(
      `${ffiType} ${name.HybridTSpec}_get_${rustPropName}(void* rustPtr);`,
    );
    if (!prop.isReadonly) {
      externDecls.push(
        `void ${name.HybridTSpec}_set_${rustPropName}(void* rustPtr, ${ffiType} value);`,
      );
    }
  }

  for (const method of spec.methods) {
    const rustMethodName = toSnakeCase(method.name);
    // For Promise-returning methods, the FFI function returns the inner type
    const effectiveReturnType =
      method.returnType.kind === "promise"
        ? getTypeAs(method.returnType, PromiseType).resultingType
        : method.returnType;
    const returnBridged = new RustCxxBridgedType(effectiveReturnType);
    const ffiReturnType = returnBridged.getCppFfiType();
    const params = method.parameters
      .filter((p) => p.type.kind !== "void" && p.type.kind !== "null")
      .map((p) => {
        const bridged = new RustCxxBridgedType(p.type);
        return `${bridged.getCppFfiType()} ${p.name}`;
      })
      .join(", ");
    const paramsWithComma = params.length > 0 ? `, ${params}` : "";
    externDecls.push(
      `${ffiReturnType} ${name.HybridTSpec}_${rustMethodName}(void* rustPtr${paramsWithComma});`,
    );
  }

  externDecls.push(`size_t ${name.HybridTSpec}_memory_size(void* rustPtr);`);
  externDecls.push(`void ${name.HybridTSpec}_destroy(void* rustPtr);`);
  externDecls.push(`void __nitrogen_free_cstring(char* ptr);`);

  // Property implementations (getter/setter overrides) with type conversion
  const propertyImpls: string[] = [];
  for (const prop of spec.properties) {
    const rustPropName = toSnakeCase(prop.name);
    const cppType = prop.type.getCode("c++");
    const getterName = prop.getGetterName("other");
    const bridged = new RustCxxBridgedType(prop.type);

    if (bridged.needsSpecialHandling) {
      const ffiCall = `${name.HybridTSpec}_get_${rustPropName}(_rustPtr)`;
      const converted = bridged.parseFromRustToCpp(ffiCall, "c++");
      propertyImpls.push(
        `inline ${cppType} ${getterName}() override { return ${converted}; }`,
      );
    } else {
      propertyImpls.push(
        `inline ${cppType} ${getterName}() override { return ${name.HybridTSpec}_get_${rustPropName}(_rustPtr); }`,
      );
    }

    if (!prop.isReadonly) {
      const setterName = prop.getSetterName("other");
      const paramType = prop.type.canBePassedByReference
        ? `const ${cppType}&`
        : cppType;
      if (bridged.needsSpecialHandling) {
        const converted = bridged.parseFromCppToRust(prop.name, "c++");
        propertyImpls.push(
          `inline void ${setterName}(${paramType} ${prop.name}) override { ${name.HybridTSpec}_set_${rustPropName}(_rustPtr, ${converted}); }`,
        );
      } else {
        propertyImpls.push(
          `inline void ${setterName}(${paramType} ${prop.name}) override { ${name.HybridTSpec}_set_${rustPropName}(_rustPtr, ${prop.name}); }`,
        );
      }
    }
  }

  // Method implementations with type conversion
  const methodImpls: string[] = [];
  for (const method of spec.methods) {
    const rustMethodName = toSnakeCase(method.name);
    const returnType = method.returnType.getCode("c++");
    const isPromise = method.returnType.kind === "promise";

    // For Promise-returning methods, get the inner type for FFI
    const effectiveReturnType = isPromise
      ? getTypeAs(method.returnType, PromiseType).resultingType
      : method.returnType;
    const returnBridged = new RustCxxBridgedType(effectiveReturnType);
    const hasReturn = effectiveReturnType.kind !== "void";

    // C++ method params use native C++ types (skip void/null params)
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

    // Convert C++ args to FFI types for the extern "C" call
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
      // Promise-returning methods: wrap the synchronous FFI call in Promise<T>::async()
      const innerCppType = effectiveReturnType.getCode("c++");
      if (hasReturn) {
        if (returnBridged.needsSpecialHandling) {
          const converted = returnBridged.parseFromRustToCpp("__result", "c++");
          methodImpls.push(
            `inline ${returnType} ${method.name}(${params}) override {\n` +
              `      return Promise<${innerCppType}>::async([=]() -> ${innerCppType} {\n` +
              `        auto __result = ${ffiCall};\n` +
              `        return ${converted};\n` +
              `      });\n` +
              `    }`,
          );
        } else {
          methodImpls.push(
            `inline ${returnType} ${method.name}(${params}) override {\n` +
              `      return Promise<${innerCppType}>::async([=]() -> ${innerCppType} {\n` +
              `        return ${ffiCall};\n` +
              `      });\n` +
              `    }`,
          );
        }
      } else {
        // Promise<void>
        methodImpls.push(
          `inline ${returnType} ${method.name}(${params}) override {\n` +
            `      return Promise<void>::async([=]() {\n` +
            `        ${ffiCall};\n` +
            `      });\n` +
            `    }`,
        );
      }
    } else if (hasReturn && returnBridged.needsSpecialHandling) {
      const converted = returnBridged.parseFromRustToCpp("__result", "c++");
      methodImpls.push(
        `inline ${returnType} ${method.name}(${params}) override { auto __result = ${ffiCall}; return ${converted}; }`,
      );
    } else {
      methodImpls.push(
        `inline ${returnType} ${method.name}(${params}) override { ${hasReturn ? "return " : ""}${ffiCall}; }`,
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

#include "${name.HybridTSpec}.hpp"

${cppExtraIncludes.join("\n")}

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
