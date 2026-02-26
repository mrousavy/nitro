import { NitroConfig } from "../../config/NitroConfig.js";
import {
  createFileMetadataString,
  createRustFileMetadataString,
} from "../../syntax/helpers.js";
import { getHybridObjectName } from "../../syntax/getHybridObjectName.js";
import type { SourceFile } from "../../syntax/SourceFile.js";

/**
 * Generates a `NitroBuffer.rs` file that provides a zero-copy ArrayBuffer
 * type for use across the Rust/C++ FFI boundary.
 *
 * The C++ side creates a NitroBuffer with a pointer to the ArrayBuffer's data,
 * a handle to the shared_ptr, and a release function. Rust can read/write the
 * data directly without copying, and the C++ ArrayBuffer stays alive until
 * the NitroBuffer is dropped.
 */
export function createRustNitroBuffer(): SourceFile {
  const code = `
${createRustFileMetadataString("NitroBuffer.rs")}

use std::ffi::c_void;

/// A zero-copy buffer type for passing ArrayBuffer data across the FFI boundary.
///
/// On the C++ side, a \`NitroBuffer\` is created from a \`shared_ptr<ArrayBuffer>\`:
/// - \`data\` points directly to the ArrayBuffer's memory
/// - \`len\` is the byte length
/// - \`handle\` is an opaque pointer to the boxed \`shared_ptr\` (prevents deallocation)
/// - \`release_fn\` frees the \`handle\` when the NitroBuffer is dropped
///
/// On the Rust side, you can access the data as a slice without copying.
/// If you need an owned \`Vec<u8>\`, use \`to_vec()\` which will copy.
#[repr(C)]
pub struct NitroBuffer {
    data: *mut u8,
    len: usize,
    handle: *mut c_void,
    release_fn: unsafe extern "C" fn(*mut c_void),
}

// SAFETY: NitroBuffer owns its handle and the C++ shared_ptr it points to
// is thread-safe (reference counting is atomic). The data pointer remains
// valid as long as the handle is alive. NitroBuffer can be sent between threads.
// Note: Sync is NOT implemented because as_mut_slice() allows unsynchronized
// mutable access to the data pointer, which would be a data race if shared.
unsafe impl Send for NitroBuffer {}

impl NitroBuffer {
    /// Create a NitroBuffer that takes ownership of a Vec<u8>.
    pub fn from_vec(mut vec: Vec<u8>) -> Self {
        let data = vec.as_mut_ptr();
        let len = vec.len();
        let handle = Box::into_raw(Box::new(vec)) as *mut c_void;

        unsafe extern "C" fn release_vec(handle: *mut c_void) {
            unsafe { drop(Box::from_raw(handle as *mut Vec<u8>)); }
        }

        NitroBuffer {
            data,
            len,
            handle,
            release_fn: release_vec,
        }
    }

    /// Get an immutable slice of the buffer's data.
    ///
    /// # Safety
    /// The caller must ensure this NitroBuffer has not been dropped
    /// and the data pointer is still valid.
    pub unsafe fn as_slice(&self) -> &[u8] {
        unsafe { std::slice::from_raw_parts(self.data, self.len) }
    }

    /// Get a mutable slice of the buffer's data.
    ///
    /// # Safety
    /// The caller must ensure this NitroBuffer has not been dropped,
    /// the data pointer is still valid, and there are no other references
    /// to this data.
    pub unsafe fn as_mut_slice(&mut self) -> &mut [u8] {
        unsafe { std::slice::from_raw_parts_mut(self.data, self.len) }
    }

    /// Copy the buffer's data into a new owned Vec<u8>.
    pub fn to_vec(&self) -> Vec<u8> {
        unsafe { self.as_slice().to_vec() }
    }

    /// Get the length of the buffer in bytes.
    pub fn len(&self) -> usize {
        self.len
    }

    /// Check if the buffer is empty.
    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    /// Get a raw pointer to the buffer's data.
    pub fn as_ptr(&self) -> *const u8 {
        self.data
    }

    /// Get a mutable raw pointer to the buffer's data.
    pub fn as_mut_ptr(&mut self) -> *mut u8 {
        self.data
    }
}

impl Drop for NitroBuffer {
    fn drop(&mut self) {
        unsafe {
            (self.release_fn)(self.handle);
        }
    }
}
`.trim();

  return {
    content: code,
    name: "NitroBuffer.rs",
    subdirectory: [],
    language: "rust",
    platform: "shared",
  };
}

/**
 * Generates a `lib.rs` file that declares all generated Rust modules.
 * Also generates stub modules for any referenced but non-generated types
 * (e.g., external HybridObject traits).
 * This must be called after all Rust files have been collected.
 */
export function createRustLibRs(allFiles: SourceFile[]): SourceFile {
  const rustFiles = allFiles
    .filter((f) => f.language === "rust" && f.name.endsWith(".rs"))
    .map((f) => f.name.replace(".rs", ""))
    .filter((name) => name !== "lib");

  // Scan generated file content for `use super::X` or `use super::X::Y` imports
  // to find referenced modules that aren't generated
  const generatedModules = new Set(rustFiles);
  const referencedModules = new Set<string>();

  for (const file of allFiles) {
    if (file.language !== "rust" || !file.name.endsWith(".rs")) continue;
    const matches = file.content.matchAll(
      /use super::([a-zA-Z_][a-zA-Z0-9_]*)/g,
    );
    for (const match of matches) {
      const moduleName = match[1]!;
      if (!generatedModules.has(moduleName)) {
        referencedModules.add(moduleName);
      }
    }
  }

  const modDeclarations = rustFiles
    .map((name) => `pub mod ${name};`)
    .join("\n");

  // Generate stub modules for missing referenced types
  let stubs = "";
  if (referencedModules.size > 0) {
    const stubLines: string[] = [];
    stubLines.push("");
    stubLines.push("// Stub modules for externally referenced types.");
    stubLines.push(
      "// These are types referenced by the generated code but not implemented in Rust.",
    );
    stubLines.push(
      "// Replace these stubs with real implementations or external crate imports as needed.",
    );
    for (const moduleName of [...referencedModules].sort()) {
      if (moduleName === "Promise") {
        // Promise is a Nitro built-in type — provide a generic stub
        stubLines.push(
          `pub mod Promise { pub struct Promise<T>(pub std::marker::PhantomData<T>); }`,
        );
      } else if (moduleName.startsWith("Hybrid")) {
        // HybridObject trait stub
        const traitName = moduleName;
        stubLines.push(
          `pub mod ${moduleName} { pub trait ${traitName}: Send + Sync {} }`,
        );
      } else {
        // Unknown type — provide an empty module
        stubLines.push(`pub mod ${moduleName} { }`);
      }
    }
    stubs = stubLines.join("\n");
  }

  const code = `
${createRustFileMetadataString("lib.rs")}

${modDeclarations}
${stubs}

/// Free a Rust-allocated CString from C++.
/// This is called by the C++ bridge to deallocate strings returned from Rust.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn __nitrogen_free_cstring(ptr: *mut std::ffi::c_char) {
    unsafe { let _ = std::ffi::CString::from_raw(ptr); }
}

/// Convert a panic payload into a C string for FFI error propagation.
pub fn __nitro_panic_to_cstring(panic: Box<dyn std::any::Any + Send>) -> *mut std::ffi::c_char {
    let msg = if let Some(s) = panic.downcast_ref::<&str>() {
        s.to_string()
    } else if let Some(s) = panic.downcast_ref::<String>() {
        s.clone()
    } else {
        "unknown Rust panic".to_string()
    };
    let safe = msg.replace('\\0', "");
    std::ffi::CString::new(safe).unwrap_or_default().into_raw()
}

// FFI result structs for error propagation across the Rust/C++ boundary.
// Each shim returns one of these instead of a bare value, so panics
// can be caught with catch_unwind and reported to C++ as errors.

#[repr(C)]
pub struct __FfiResult_void {
    pub is_ok: u8,
    pub error: *mut std::ffi::c_char,
}

#[repr(C)]
pub struct __FfiResult_f64 {
    pub is_ok: u8,
    pub error: *mut std::ffi::c_char,
    pub value: f64,
}

#[repr(C)]
pub struct __FfiResult_bool {
    pub is_ok: u8,
    pub error: *mut std::ffi::c_char,
    pub value: bool,
}

#[repr(C)]
pub struct __FfiResult_i32 {
    pub is_ok: u8,
    pub error: *mut std::ffi::c_char,
    pub value: i32,
}

#[repr(C)]
pub struct __FfiResult_i64 {
    pub is_ok: u8,
    pub error: *mut std::ffi::c_char,
    pub value: i64,
}

#[repr(C)]
pub struct __FfiResult_u64 {
    pub is_ok: u8,
    pub error: *mut std::ffi::c_char,
    pub value: u64,
}

#[repr(C)]
pub struct __FfiResult_usize {
    pub is_ok: u8,
    pub error: *mut std::ffi::c_char,
    pub value: usize,
}

#[repr(C)]
pub struct __FfiResult_cstr {
    pub is_ok: u8,
    pub error: *mut std::ffi::c_char,
    pub value: *const std::ffi::c_char,
}

#[repr(C)]
pub struct __FfiResult_ptr {
    pub is_ok: u8,
    pub error: *mut std::ffi::c_char,
    pub value: *mut std::ffi::c_void,
}
  `.trim();

  return {
    content: code,
    name: "lib.rs",
    subdirectory: [],
    language: "rust",
    platform: "shared",
  };
}

/**
 * Generates a `Cargo.toml` file for the generated Rust crate.
 */
export function createRustCargoToml(): SourceFile {
  const name = NitroConfig.current.getAndroidCxxLibName();
  const crateName = name
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");

  const implCrate = NitroConfig.current.getRustImplCrate();
  // Generated crate is at nitrogen/generated/shared/rust/ relative to project root
  // The impl crate path is relative to the generated Cargo.toml location
  // which is at: nitrogen/generated/shared/rust/Cargo.toml
  // The project root (where the user's Cargo.toml lives) is 4 levels up.
  // TODO: Make this configurable via NitroConfig if projects use non-standard layouts.
  const implCrateDep = implCrate != null
    ? `\n[dependencies]\n${implCrate} = { path = "../../../../" }\n`
    : "";

  // The [lib] name must match what CMake and CocoaPods expect:
  // `lib${name}_rust.a` where `name` is the raw androidCxxLibName (e.g. NitroTest).
  const libName = `${name}_rust`;

  const code = `
${createFileMetadataString("Cargo.toml", "#")}

[workspace]

[package]
name = "${crateName}_rust"
version = "0.1.0"
edition = "2021"

[lib]
name = "${libName}"
path = "lib.rs"
crate-type = ["staticlib"]
${implCrateDep}
  `.trim();

  return {
    content: code,
    name: "Cargo.toml",
    subdirectory: [],
    language: "rust",
    platform: "shared",
  };
}

/**
 * Find the matching closing delimiter for an opening one, respecting nesting.
 * Returns the index of the closing delimiter, or -1 if not found.
 */
function findMatchingClose(
  str: string,
  startIdx: number,
  open: string,
  close: string,
): number {
  let depth = 0;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === open) depth++;
    if (str[i] === close) depth--;
    if (depth === 0) return i;
  }
  return -1;
}

/**
 * Extract the content of the outermost balanced parens starting at `(`.
 * Handles nested parens like `Box<dyn Fn(f64) -> String>`.
 */
function extractBalancedParens(str: string, openIdx: number): string {
  const closeIdx = findMatchingClose(str, openIdx, "(", ")");
  if (closeIdx === -1) return "";
  return str.slice(openIdx + 1, closeIdx);
}

/**
 * Split a string on commas, but only at the top level (not inside <>, (), []).
 * Handles `->` (Rust closure return arrow) without treating `>` as a bracket close.
 */
function splitTopLevelCommas(str: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]!;
    const prev = i > 0 ? str[i - 1] : "";
    if (ch === "<" || ch === "(" || ch === "[") depth++;
    // Only treat `>` as bracket close if it's not part of `->`
    if ((ch === ">" && prev !== "-") || ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  const trimmed = current.trim();
  if (trimmed.length > 0) parts.push(trimmed);
  return parts;
}

/**
 * Extract trait method signatures from a generated Rust trait file.
 * Returns an array of method signature strings (without the trailing semicolon),
 * excluding methods with default implementations (like `memory_size`).
 */
function extractTraitMethods(
  rustContent: string,
  traitName: string,
): string[] {
  // Find the trait block
  const traitStart = rustContent.indexOf(
    `pub trait ${traitName}: Send + Sync {`,
  );
  if (traitStart === -1) return [];

  const traitOpenBrace = rustContent.indexOf("{", traitStart);
  const traitEnd = findMatchingClose(rustContent, traitOpenBrace, "{", "}");
  if (traitEnd === -1) return [];

  const traitBody = rustContent.slice(traitOpenBrace + 1, traitEnd);

  // Parse method signatures line by line, collecting multi-line signatures.
  // A method starts with `fn ` and ends with either `;` (abstract) or `{` (default impl).
  const methods: string[] = [];
  let currentSig = "";
  let inMethod = false;

  for (const line of traitBody.split("\n")) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("///") ||
      trimmed.length === 0
    ) {
      if (!inMethod) continue;
    }

    if (!inMethod && trimmed.startsWith("fn ")) {
      inMethod = true;
      currentSig = trimmed;
    } else if (inMethod) {
      currentSig += " " + trimmed;
    }

    if (inMethod) {
      if (currentSig.includes(";")) {
        // Abstract method (no body) — extract signature before the semicolon
        const sigPart = currentSig.slice(0, currentSig.indexOf(";")).trim();
        methods.push(sigPart);
        currentSig = "";
        inMethod = false;
      } else if (currentSig.includes("{")) {
        // Method with default implementation — skip it
        currentSig = "";
        inMethod = false;
      }
    }
  }

  return methods;
}

/**
 * Parse a trait method signature into its components for delegation.
 * Handles complex types with nested parens like `Box<dyn Fn(f64) -> String>`.
 * Input: "fn method_name(&self, param: Type) -> ReturnType"
 */
function parseMethodSignature(sig: string): {
  name: string;
  selfParam: string;
  params: { name: string; type: string }[];
  returnType: string | undefined;
} {
  // Extract method name
  const nameMatch = sig.match(/fn\s+(\w+)/);
  const name = nameMatch![1]!;

  // Find the outermost parameter list parens
  const parenOpen = sig.indexOf("(");
  const paramsStr = extractBalancedParens(sig, parenOpen);
  const parenClose = parenOpen + 1 + paramsStr.length;

  // Parse self parameter
  const selfMatch = paramsStr.match(/&(mut\s+)?self/);
  const selfParam = selfMatch ? (selfMatch[1] ? "&mut self" : "&self") : "&self";

  // Parse remaining parameters (after self)
  const params: { name: string; type: string }[] = [];
  const afterSelf = paramsStr.replace(/&(mut\s+)?self\s*,?\s*/, "").trim();
  if (afterSelf.length > 0) {
    const paramParts = splitTopLevelCommas(afterSelf);
    for (const part of paramParts) {
      if (part.length === 0) continue;
      const colonIdx = part.indexOf(":");
      if (colonIdx === -1) continue;
      params.push({
        name: part.slice(0, colonIdx).trim(),
        type: part.slice(colonIdx + 1).trim(),
      });
    }
  }

  // Extract return type — everything after `) ->` at the top level
  const afterParens = sig.slice(parenClose + 1).trim();
  const arrowMatch = afterParens.match(/^->\s*(.+)$/);
  const returnType = arrowMatch ? arrowMatch[1]!.trim() : undefined;

  return { name, selfParam, params, returnType };
}

/**
 * Generates a `factory.rs` file with `create_HybridTSpec()` factory functions
 * and `impl HybridTSpec for UserStruct` delegation blocks for each
 * Rust-autolinked HybridObject.
 *
 * The delegation blocks bridge the user's implementation struct (which can't
 * directly implement the generated trait due to cross-crate restrictions)
 * to the generated trait by forwarding each method call.
 *
 * Returns `undefined` if there are no Rust-autolinked HybridObjects.
 */
export function createRustFactory(
  allFiles: SourceFile[],
): SourceFile | undefined {
  const autolinkedHybridObjects =
    NitroConfig.current.getAutolinkedHybridObjects();
  const implCrate = NitroConfig.current.getRustImplCrate();
  // Convert crate name to Rust identifier (e.g. "jazz-nitro" -> "jazz_nitro")
  const implCrateIdent = implCrate?.replace(/-/g, "_");

  const traitImports: string[] = [];
  const implImports: string[] = [];
  const implBlocks: string[] = [];
  const factories: string[] = [];

  for (const hybridObjectName of Object.keys(autolinkedHybridObjects)) {
    const config = autolinkedHybridObjects[hybridObjectName];
    if (config?.rust == null) continue;

    const rustClassName = config.rust;
    const { HybridTSpec } = getHybridObjectName(hybridObjectName);
    const factoryFunctionName = `create_${HybridTSpec}`;

    traitImports.push(`use super::${HybridTSpec}::${HybridTSpec};`);

    if (implCrateIdent != null) {
      implImports.push(`use ${implCrateIdent}::${rustClassName};`);
    }

    // Find the generated trait file and extract method signatures
    const traitFile = allFiles.find(
      (f) => f.name === `${HybridTSpec}.rs` && f.language === "rust",
    );
    if (traitFile != null) {
      const methods = extractTraitMethods(traitFile.content, HybridTSpec);
      const delegations = methods.map((sig) => {
        const parsed = parseMethodSignature(sig);
        const paramNames = parsed.params.map((p) => p.name).join(", ");
        const call = paramNames.length > 0
          ? `self.0.${parsed.name}(${paramNames})`
          : `self.0.${parsed.name}()`;
        const body = call;
        const allParams = [
          parsed.selfParam,
          ...parsed.params.map((p) => `${p.name}: ${p.type}`),
        ].join(", ");
        const retSuffix = parsed.returnType != null ? ` -> ${parsed.returnType}` : "";
        return `    fn ${parsed.name}(${allParams})${retSuffix} {\n        ${body}\n    }`;
      });

      implBlocks.push(
        `/// Wrapper that delegates the generated trait to the user's implementation.
struct ${rustClassName}Wrapper(${rustClassName});

impl ${HybridTSpec} for ${rustClassName}Wrapper {
${delegations.join("\n\n")}
}`,
      );
    }

    // Factory creates the wrapper (if available), or the raw struct directly
    const constructExpr = traitFile != null
      ? `${rustClassName}Wrapper(${rustClassName}::new())`
      : `${rustClassName}::new()`;

    factories.push(`
#[unsafe(no_mangle)]
pub extern "C" fn ${factoryFunctionName}() -> *mut std::ffi::c_void {
    let obj: Box<dyn ${HybridTSpec}> = Box::new(${constructExpr});
    Box::into_raw(Box::new(obj)) as *mut std::ffi::c_void
}`.trim());
  }

  if (factories.length === 0) {
    return undefined;
  }

  const implImportBlock = implImports.length > 0
    ? implImports.join("\n")
    : "// TODO: Import your implementation struct(s) here.\n// Example: use my_crate::MyImpl;";

  const code = `
${createRustFileMetadataString("factory.rs")}

${traitImports.join("\n")}
${implImportBlock}

${implBlocks.join("\n\n")}

${factories.join("\n\n")}
  `.trim();

  return {
    content: code,
    name: "factory.rs",
    subdirectory: [],
    language: "rust",
    platform: "shared",
  };
}
