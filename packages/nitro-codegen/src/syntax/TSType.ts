import { ts, type Type } from 'ts-morph'
import type { CodeNode } from './CodeNode.js'
import { escapeCppName, removeDuplicates } from './helpers.js'
import type { SourceFile } from './SourceFile.js'
import { createCppEnum } from './c++/CppEnum.js'
import { createCppUnion } from './c++/CppUnion.js'
import { createCppStruct } from './c++/CppStruct.js'

function isSymbol(type: Type, symbolName: string): boolean {
  const symbol = type.getSymbol()
  if (symbol?.getName() === symbolName) {
    return true
  }
  const aliasSymbol = type.getAliasSymbol()
  if (aliasSymbol?.getName() === symbolName) {
    return true
  }
  return false
}

function isPromise(type: Type): boolean {
  return isSymbol(type, 'Promise')
}

function isRecord(type: Type): boolean {
  return isSymbol(type, 'Record')
}

function isArrayBuffer(type: Type): boolean {
  return isSymbol(type, 'ArrayBuffer')
}

export class TSType implements CodeNode {
  readonly type: Type
  readonly isOptional: boolean
  readonly passByConvention: 'by-reference' | 'by-value'
  private readonly cppName: string
  private readonly extraFiles: SourceFile[]

  private readonly baseTypes: TSType[]
  private readonly referencedTypes: TSType[]

  constructor(type: Type, isOptional: boolean) {
    this.type = type
    this.isOptional = isOptional
    this.baseTypes = []
    this.referencedTypes = []
    this.extraFiles = []

    if (type.isNull() || type.isUndefined()) {
      this.cppName = 'std::nullptr_t'
      this.passByConvention = 'by-value'
    } else if (type.isBoolean() || type.isBooleanLiteral()) {
      this.cppName = 'bool'
      this.passByConvention = 'by-value'
    } else if (type.isNumber() || type.isNumberLiteral()) {
      this.cppName = 'double'
      this.passByConvention = 'by-value'
    } else if (type.isString()) {
      this.cppName = 'std::string'
      this.passByConvention = 'by-reference'
    } else if (type.isBigInt() || type.isBigIntLiteral()) {
      this.cppName = 'int64_t'
      this.passByConvention = 'by-value'
    } else if (type.isVoid()) {
      this.cppName = 'void'
      this.passByConvention = 'by-value'
    } else if (type.isArray() || type.isTuple()) {
      const arrayElementType = type.getArrayElementTypeOrThrow()
      const elementType = new TSType(
        arrayElementType,
        arrayElementType.isNullable()
      )
      this.cppName = `std::vector<${elementType.cppName}>`
      this.passByConvention = 'by-reference'
      this.referencedTypes.push(elementType)
    } else if (type.getCallSignatures().length > 0) {
      // It's a function!
      const callSignatures = type.getCallSignatures()
      const callSignature = callSignatures[0]
      if (callSignatures.length !== 1 || callSignature == null) {
        throw new Error(
          `Function overloads are not supported in Nitrogen! (in ${type.getText()})`
        )
      }

      const funcReturnType = callSignature.getReturnType()
      const returnType = new TSType(funcReturnType, funcReturnType.isNullable())
      const parameters = callSignature.getParameters().map((p) => {
        const declaration = p.getValueDeclarationOrThrow()
        const t = p.getTypeAtLocation(declaration)
        return new TSType(t, p.isOptional() || t.isNullable())
      })
      const cppParamsArgs = parameters.map((p) => p.cppName).join(', ')

      this.cppName = `std::function<${returnType.cppName}(${cppParamsArgs})>`
      this.passByConvention = 'by-reference'
      this.referencedTypes.push(returnType, ...parameters)
    } else if (isPromise(type)) {
      // It's a Promise!
      const typename = type.getSymbolOrThrow().getEscapedName()
      const typeArguments = type.getTypeArguments()
      const promiseResolvingType = typeArguments[0]
      if (typeArguments.length !== 1 || promiseResolvingType == null) {
        throw new Error(
          `Type ${typename} looks like a Promise, but has ${typeArguments.length} type arguments instead of 1 (<T>)!`
        )
      }
      const resolvingType = new TSType(
        promiseResolvingType,
        promiseResolvingType.isNullable()
      )
      this.cppName = `std::future<${resolvingType.cppName}>`
      this.passByConvention = 'by-reference'
      this.referencedTypes.push(resolvingType)
    } else if (isRecord(type)) {
      // Record<K, V> -> unordered_map<K, V>
      const typename = type.getAliasSymbolOrThrow().getEscapedName()
      const typeArgs = type.getAliasTypeArguments()
      const [keyTypeT, valueTypeT] = typeArgs
      if (typeArgs.length !== 2 || keyTypeT == null || valueTypeT == null) {
        throw new Error(
          `Type ${typename} looks like a Record, but has ${typeArgs.length} type arguments instead of 2 (<K, V>)!`
        )
      }
      const keyType = new TSType(keyTypeT, false)
      const valueType = new TSType(valueTypeT, false)
      this.cppName = `std::unordered_map<${keyType.cppName}, ${valueType.cppName}>`
      this.passByConvention = 'by-reference'
      this.referencedTypes.push(keyType, valueType)
    } else if (isArrayBuffer(type)) {
      // ArrayBuffer
      this.cppName = 'std::shared_ptr<ArrayBuffer>'
      this.passByConvention = 'by-value'
    } else if (type.isEnum()) {
      // It is an enum. We need to generate enum interface
      const typename = type.getSymbolOrThrow().getEscapedName()
      this.passByConvention = 'by-value'
      this.cppName = typename
      const declaration = type.getSymbolOrThrow().getValueDeclarationOrThrow()
      const enumDeclaration = declaration.asKindOrThrow(
        ts.SyntaxKind.EnumDeclaration
      )
      // C++ enum is a separate file. Add it
      const enumFile = createCppEnum(typename, enumDeclaration.getMembers())
      this.extraFiles.push(enumFile)
    } else if (type.isUnion()) {
      const symbol = type.getAliasSymbol()
      if (symbol == null) {
        // It is an inline union instead of a separate type declaration!
        throw new Error(
          `Inline union types ("${type.getText()}") are not supported by Nitrogen!\n` +
            `Extract the union to a separate type, and re-run nitrogen!`
        )
      }
      const typename = symbol.getEscapedName()
      this.passByConvention = 'by-value'
      this.cppName = typename
      // C++ union enum is a separate file. Add it
      const enumFile = createCppUnion(typename, type.getUnionTypes())
      this.extraFiles.push(enumFile)
    } else if (type.isInterface()) {
      // It references another interface/type, either a simple struct, or another HybridObject
      const typename = type.getSymbolOrThrow().getEscapedName()

      const isHybridObject = type
        .getBaseTypes()
        .some((t) => t.getText().includes('HybridObject'))

      if (isHybridObject) {
        // It is another HybridObject being referenced! We can use the generated *Spec
        this.cppName = `std::shared_ptr<${typename}Spec>`
        this.passByConvention = 'by-value' // shared_ptr should be passed by value
      } else {
        // It is a simple struct being referenced.
        this.cppName = typename
        this.passByConvention = 'by-reference'
        const extraFile = createCppStruct(typename, type.getProperties())
        this.referencedTypes.push(...extraFile.referencedTypes)
        this.extraFiles.push(extraFile)
      }
    } else if (type.isStringLiteral()) {
      throw new Error(
        `String literal ${type.getText()} cannot be represented in C++ because it is ambiguous between a string and a discriminating union enum.`
      )
    } else {
      throw new Error(
        `The TypeScript type "${type.getText()}" cannot be represented in C++!`
      )
    }
  }

  getCode(): string {
    if (this.isOptional) {
      return `std::optional<${this.cppName}>`
    } else {
      return this.cppName
    }
  }

  getDefinitionFiles(): SourceFile[] {
    const extra = this.extraFiles
    const inheritedDefinitionFiles = this.baseTypes.flatMap((b) =>
      b.getDefinitionFiles()
    )
    const referencedDefinitionFiles = this.referencedTypes.flatMap((r) =>
      r.getDefinitionFiles()
    )
    const allFiles = [
      ...extra,
      ...inheritedDefinitionFiles,
      ...referencedDefinitionFiles,
    ]
    return removeDuplicates(allFiles, (a, b) => a.name === b.name)
  }
}

export class NamedTSType extends TSType {
  readonly name: string
  get escapedName(): string {
    return escapeCppName(this.name)
  }

  constructor(type: Type, isOptional: boolean, name: string) {
    super(type, isOptional)
    this.name = name
  }
}

export class VoidType implements CodeNode {
  constructor() {}

  getCode(): string {
    return 'void'
  }

  getDefinitionFiles(): SourceFile[] {
    return []
  }
}
