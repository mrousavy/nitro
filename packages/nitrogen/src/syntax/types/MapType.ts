import type { Language } from "../../getPlatformSpecs.js";
import type { SourceFile, SourceImport } from "../SourceFile.js";
import type { Type, TypeKind } from "./Type.js";
import { createRustAnyMap } from "../rust/RustAnyMap.js";

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
        // AnyMap is an opaque C++ type wrapped in a type-safe Rust newtype.
        return "AnyMap";
      default:
        throw new Error(
          `Language ${language} is not yet supported for MapType!`,
        );
    }
  }
  getExtraFiles(): SourceFile[] {
    return [createRustAnyMap()];
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
        imports.push({
          name: "super::any_map::AnyMap",
          language: "rust",
          space: "user",
        });
        break;
    }
    return imports;
  }
}
