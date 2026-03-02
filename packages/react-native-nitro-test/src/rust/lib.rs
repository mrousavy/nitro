mod hybrid_test_object_rust;

use std::sync::Arc;

use nitro_test_rust::hybrid_test_object_rust_spec::HybridTestObjectRustSpec;

pub use hybrid_test_object_rust::HybridTestObjectRust;

#[unsafe(no_mangle)]
pub extern "C" fn create_HybridTestObjectRustSpec() -> *mut std::ffi::c_void {
    let obj: Arc<dyn HybridTestObjectRustSpec> = Arc::new(HybridTestObjectRust::new());
    Box::into_raw(Box::new(obj)) as *mut std::ffi::c_void
}
