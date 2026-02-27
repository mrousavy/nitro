import type { Language } from "../../getPlatformSpecs.js";
import { type SourceFile, type SourceImport } from "../SourceFile.js";
import { ErrorType } from "./ErrorType.js";
import { FunctionType } from "./FunctionType.js";
import { NamedWrappingType } from "./NamedWrappingType.js";
import type { GetCodeOptions, Type, TypeKind } from "./Type.js";
import { VoidType } from "./VoidType.js";

export class PromiseType implements Type {
  readonly resultingType: Type;
  readonly errorType: Type;

  constructor(resultingType: Type) {
    this.resultingType = resultingType;
    this.errorType = new ErrorType();
  }

  get canBePassedByReference(): boolean {
    // It's a future<..>, it cannot be copied.
    return true;
  }
  get kind(): TypeKind {
    return "promise";
  }
  get isEquatable(): boolean {
    return false;
  }

  get resolverFunction(): FunctionType {
    if (this.resultingType.kind === "void") {
      return new FunctionType(new VoidType(), []);
    } else {
      return new FunctionType(new VoidType(), [
        new NamedWrappingType("value", this.resultingType),
      ]);
    }
  }

  get rejecterFunction(): FunctionType {
    return new FunctionType(new VoidType(), [
      new NamedWrappingType("error", this.errorType),
    ]);
  }

  getCode(language: Language, options?: GetCodeOptions): string {
    const resultingCode = this.resultingType.getCode(language, options);
    switch (language) {
      case "c++":
        return `std::shared_ptr<Promise<${resultingCode}>>`;
      case "swift":
        return `Promise<${resultingCode}>`;
      case "kotlin":
        return `Promise<${resultingCode}>`;
      case "rust":
        // For Rust, Promises are unwrapped: the Rust trait returns the inner type
        // synchronously, and the C++ bridge wraps the call in Promise<T>::async().
        return resultingCode;
      default:
        throw new Error(
          `Language ${language} is not yet supported for PromiseType!`,
        );
    }
  }
  getExtraFiles(): SourceFile[] {
    return this.resultingType.getExtraFiles();
  }
  getRequiredImports(language: Language): SourceImport[] {
    const imports: SourceImport[] =
      this.resultingType.getRequiredImports(language);
    switch (language) {
      case "c++":
        imports.push({
          language: "c++",
          name: "NitroModules/Promise.hpp",
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
          name: "com.margelo.nitro.core.Promise",
          language: "kotlin",
          space: "system",
        });
        break;
      case "rust":
        // No Promise import needed for Rust — the trait returns the inner type
        // directly, and the C++ bridge handles Promise wrapping.
        break;
    }
    return imports;
  }
}
