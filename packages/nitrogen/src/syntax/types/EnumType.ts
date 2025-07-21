import { EnumDeclaration } from 'ts-morph'
import { Type as TSMorphType, type ts } from 'ts-morph'
import type { Language } from '../../getPlatformSpecs.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import { type SourceFile, type SourceImport } from '../SourceFile.js'
import type { Type, TypeKind } from './Type.js'
import { createCppEnum } from '../c++/CppEnum.js'
import { escapeCppName } from '../helpers.js'
import { createCppUnion } from '../c++/CppUnion.js'
import { NitroConfig } from '../../config/NitroConfig.js'

export interface EnumMember {
  name: string
  value: number
  stringValue: string
}

export class EnumType implements Type {
  readonly enumName: string
  readonly enumMembers: EnumMember[]
  readonly jsType: 'enum' | 'union'
  readonly declarationFile: SourceFile

  constructor(enumName: string, enumDeclaration: EnumDeclaration)
  constructor(enumName: string, union: TSMorphType<ts.UnionType>)
  constructor(
    enumName: string,
    declaration: EnumDeclaration | TSMorphType<ts.UnionType>
  ) {
    this.enumName = enumName
    if (declaration instanceof EnumDeclaration) {
      // It's a JS enum { ... }
      this.jsType = 'enum'
      this.enumMembers = declaration.getMembers().map<EnumMember>((m) => {
        const name = m.getSymbolOrThrow().getEscapedName()
        const value = m.getValue()
        if (typeof value !== 'number') {
          throw new Error(
            `Enum member ${enumName}.${name} is ${value} (${typeof value}), which cannot be represented in C++ enums.\n` +
              `Each enum member must be a number! If you want to use strings, use TypeScript unions ("a" | "b") instead!`
          )
        }
        return {
          name: escapeCppName(name).toUpperCase(),
          value: value,
          stringValue: name,
        }
      })
      this.declarationFile = createCppEnum(enumName, this.enumMembers)
    } else {
      // It's a TS union '..' | '..'
      this.jsType = 'union'
      this.enumMembers = declaration
        .getNonNullableType()
        .getUnionTypes()
        .map((t, i) => {
          if (t.isStringLiteral()) {
            const literalValue = t.getLiteralValueOrThrow()
            if (typeof literalValue !== 'string')
              throw new Error(
                `${enumName}: Value "${literalValue}" is not a string - it is ${typeof literalValue}!`
              )
            return {
              name: escapeCppName(literalValue).toUpperCase(),
              value: i,
              stringValue: literalValue,
            }
          } else {
            throw new Error(
              `${enumName}: Value "${t.getText()}" is not a string literal - it cannot be represented in a C++ enum!`
            )
          }
        })
      this.declarationFile = createCppUnion(enumName, this.enumMembers)
    }
    if (this.enumName.startsWith('__')) {
      throw new Error(
        `Enum name cannot start with two underscores (__) as this is reserved syntax for Nitrogen! (In ${this.enumName}: ${this.enumMembers.map((m) => m.name).join(' | ')})`
      )
    }
  }

  get canBePassedByReference(): boolean {
    // It's a primitive.
    return false
  }

  get kind(): TypeKind {
    return 'enum'
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        return this.enumName
      case 'swift':
        return this.enumName
      case 'kotlin':
        return this.enumName
      default:
        throw new Error(
          `Language ${language} is not yet supported for NumberType!`
        )
    }
  }
  getExtraFiles(): SourceFile[] {
    return [this.declarationFile]
  }
  getRequiredImports(language: Language): SourceImport[] {
    const imports: SourceImport[] = []
    if (language === 'c++') {
      const cxxNamespace = NitroConfig.current.getCxxNamespace('c++')
      imports.push({
        name: this.declarationFile.name,
        language: this.declarationFile.language,
        forwardDeclaration: getForwardDeclaration(
          'enum class',
          this.enumName,
          cxxNamespace
        ),
        space: 'user',
      })
    }
    return imports
  }
}
