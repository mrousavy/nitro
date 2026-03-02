import type { SourceFile } from "../SourceFile.js";
import { createRustFileMetadataString } from "../helpers.js";

/**
 * Creates a Rust `AnyMap` opaque wrapper type.
 *
 * AnyMap wraps an opaque C++ `shared_ptr<AnyMap>` that is passed across the
 * FFI boundary as a `*mut c_void`. The wrapper provides a type-safe API
 * boundary so that raw pointers don't leak into user-facing trait signatures.
 */
export function createRustAnyMap(): SourceFile {
  const code = `
${createRustFileMetadataString("any_map.rs")}

use std::ffi::c_void;

/// An opaque wrapper around a C++ \`AnyMap\` (untyped JS object).
///
/// This type represents a JavaScript object that doesn't have a typed schema.
/// It is passed through the FFI boundary as an opaque pointer.
/// Use typed \`HashMap<K, V>\` parameters instead when possible.
#[derive(Debug)]
pub struct AnyMap(*mut c_void);

// SAFETY: AnyMap wraps a shared_ptr<AnyMap> on the C++ side,
// which is reference-counted with atomic operations and is thread-safe.
unsafe impl Send for AnyMap {}
unsafe impl Sync for AnyMap {}

impl AnyMap {
    /// Get the underlying raw pointer.
    ///
    /// # Safety
    /// The caller must not use this pointer after the AnyMap is dropped.
    pub unsafe fn as_raw(&self) -> *mut c_void {
        self.0
    }

    /// Create an AnyMap from a raw opaque pointer.
    ///
    /// # Safety
    /// The pointer must be a valid C++ \`shared_ptr<AnyMap>\` passed from the FFI boundary.
    pub unsafe fn from_raw(ptr: *mut c_void) -> Self {
        AnyMap(ptr)
    }
}
`.trim();

  return {
    content: code,
    name: "any_map.rs",
    subdirectory: [],
    language: "rust",
    platform: "shared",
  };
}
