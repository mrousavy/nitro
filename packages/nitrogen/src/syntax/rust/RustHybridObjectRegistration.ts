import { getHybridObjectName } from "../getHybridObjectName.js";
import type { SourceImport } from "../SourceFile.js";

interface Props {
  /**
   * The name of the Hybrid Object under which it should be registered and exposed to JS to.
   */
  hybridObjectName: string;
  /**
   * The name of the Rust struct that implements the trait.
   * This struct must have a `new()` constructor.
   */
  rustClassName: string;
}

interface RustHybridObjectRegistration {
  cppCode: string;
  cppExternDeclarations: string;
  requiredImports: SourceImport[];
}

export function createRustHybridObjectRegistration({
  hybridObjectName,
  rustClassName,
}: Props): RustHybridObjectRegistration {
  const { HybridTSpec, HybridTSpecRust } =
    getHybridObjectName(hybridObjectName);

  // The Rust side provides a factory function (auto-generated in factory.rs):
  //   #[unsafe(no_mangle)]
  //   pub extern "C" fn create_HybridTSpec() -> *mut c_void
  const factoryFunctionName = `create_${HybridTSpec}`;

  return {
    requiredImports: [
      { name: `${HybridTSpecRust}.hpp`, language: "c++", space: "user" },
    ],
    cppExternDeclarations: `
// Rust factory function — auto-generated in factory.rs for "${rustClassName}".
// The Rust side defines (in factory.rs):
//   #[unsafe(no_mangle)]
//   pub extern "C" fn ${factoryFunctionName}() -> *mut std::ffi::c_void {
//       let obj: Box<dyn ${HybridTSpec}> = Box::new(${rustClassName}::new());
//       Box::into_raw(Box::new(obj)) as *mut std::ffi::c_void
//   }
extern "C" void* ${factoryFunctionName}();
      `.trim(),
    cppCode: `
HybridObjectRegistry::registerHybridObjectConstructor(
  "${hybridObjectName}",
  []() -> std::shared_ptr<HybridObject> {
    void* rustPtr = ${factoryFunctionName}();
    return std::make_shared<${HybridTSpecRust}>(rustPtr);
  }
);
      `.trim(),
  };
}
