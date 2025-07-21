import type { Language } from "../../getPlatformSpecs.js";
import { type SourceFile, type SourceImport } from "../SourceFile.js";
import type { Type, TypeKind } from "./Type.js";

export class SetType implements Type {
  readonly valueType: Type;

  constructor(valueType: Type) {
    this.valueType = valueType;
  }

  get canBePassedByReference(): boolean {
    // It's a unordered_map<..>, heavy to copy.
    return true;
  }
  get kind(): TypeKind {
    return "set";
  }

  getCode(language: Language): string {
    const valueCode = this.valueType.getCode(language);

    switch (language) {
      case "c++":
        return `std::unordered_set<${valueCode}>`;
      case "swift":
        return `Set<${valueCode}>`;
      case "kotlin":
        return `Set<${valueCode}>`;
      default:
        throw new Error(
          `Language ${language} is not yet supported for RecordType!`
        );
    }
  }
  getExtraFiles(): SourceFile[] {
    return [...this.valueType.getExtraFiles()];
  }
  getRequiredImports(): SourceImport[] {
    return [
      {
        language: "c++",
        name: "unordered_set",
        space: "system",
      },
      ...this.valueType.getRequiredImports(),
    ];
  }
}
