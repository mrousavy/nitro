import type { Language } from "../../getPlatformSpecs.js";
import type { SourceFile, SourceImport } from "../SourceFile.js";
import type { Type, TypeKind } from "./Type.js";

export class MapType implements Type {
  get canBePassedByReference(): boolean {
    // It's a shared_ptr<..>, no ref.
    return true;
  }

  get kind(): TypeKind {
    return "map";
  }
  get isEquatable(): boolean {
    return true;
  }

  getCode(language: Language): string {
    switch (language) {
      case "c++":
        return "std::shared_ptr<AnyMap>";
      case "swift":
        return "AnyMap";
      case "kotlin":
        return "AnyMap";
      case "rust":
        // AnyMap is an opaque C++ type that cannot be directly represented in Rust.
        // We pass it through as an opaque pointer. Users can interact with it via
        // FFI helper functions if needed.
        return "*mut std::ffi::c_void";
      default:
        throw new Error(
          `Language ${language} is not yet supported for MapType!`,
        );
    }
  }
  getExtraFiles(): SourceFile[] {
    return [];
  }
  getRequiredImports(language: Language): SourceImport[] {
    const imports: SourceImport[] = [];
    switch (language) {
      case "c++":
        imports.push({
          name: "NitroModules/AnyMap.hpp",
          language: "c++",
          space: "system",
        });
        break;
      case "swift":
        imports.push({
          name: "NitroModules",
          language: "swift",
          space: "system",
        });
        break;
      case "kotlin":
        imports.push({
          name: "com.margelo.nitro.core.AnyMap",
          language: "kotlin",
          space: "system",
        });
        break;
      case "rust":
        // No imports needed — map is an opaque *mut c_void
        break;
    }
    return imports;
  }
}
