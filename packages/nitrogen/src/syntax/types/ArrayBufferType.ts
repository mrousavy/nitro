import type { Language } from "../../getPlatformSpecs.js";
import type { SourceFile, SourceImport } from "../SourceFile.js";
import type { Type, TypeKind } from "./Type.js";

export class ArrayBufferType implements Type {
  get canBePassedByReference(): boolean {
    // It's a shared_ptr.
    return true;
  }

  get kind(): TypeKind {
    return "array-buffer";
  }
  get isEquatable(): boolean {
    return true;
  }

  getCode(language: Language): string {
    switch (language) {
      case "c++":
        return "std::shared_ptr<ArrayBuffer>";
      case "swift":
        return "ArrayBuffer";
      case "kotlin":
        return "ArrayBuffer";
      case "rust":
        return "NitroBuffer";
      default:
        throw new Error(
          `Language ${language} is not yet supported for ArrayBufferType!`,
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
          language: "c++",
          name: "NitroModules/ArrayBuffer.hpp",
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
          name: "com.margelo.nitro.core.ArrayBuffer",
          language: "kotlin",
          space: "system",
        });
        break;
      case "rust":
        imports.push({
          name: "super::NitroBuffer::NitroBuffer",
          language: "rust",
          space: "user",
        });
        break;
    }
    return imports;
  }
}
