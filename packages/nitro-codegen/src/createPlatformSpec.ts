import type { PlatformSpec } from 'react-native-nitro-modules';
import type { Language, Platform } from './getPlatformSpecs.js';
import type {
  InterfaceDeclaration,
  MethodSignature,
  ParameterDeclaration,
  PropertySignature,
  TypeNode,
} from 'ts-morph';
import { ts } from 'ts-morph';
import { getNodeName } from './getNodeName.js';

interface File {
  name: string;
  content: string;
  language: Language;
}

type TypeMap = { [K in ts.SyntaxKind]: string };
const typeMap: Partial<TypeMap> = {
  [ts.SyntaxKind.VoidKeyword]: 'void',
  [ts.SyntaxKind.NumberKeyword]: 'double',
  [ts.SyntaxKind.BooleanKeyword]: 'bool',
  [ts.SyntaxKind.StringKeyword]: 'std::string',
  [ts.SyntaxKind.BigIntKeyword]: 'int64_t',
};

interface CodeNode {
  getCode(language: Language): string;
}

function capitalizeName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function joinToIndented(array: string[], indentation: string = '    '): string {
  return array.join('\n').replaceAll('\n', `\n${indentation}`);
}

interface CppValueSignature {
  type: string;
  name: string;
}

interface CppMethodSignature {
  returnType: string;
  rawName: string;
  name: string;
  parameters: CppValueSignature[];
  type: 'getter' | 'setter' | 'method';
}

class Property implements CodeNode {
  readonly name: string;
  readonly type: TypeNode;
  readonly isReadonly: boolean;

  constructor(prop: PropertySignature) {
    this.name = getNodeName(prop);
    this.isReadonly = prop.hasModifier(ts.SyntaxKind.ReadonlyKeyword);
    this.type = prop.getTypeNodeOrThrow();
  }

  get cppSignatures(): CppMethodSignature[] {
    const signatures: CppMethodSignature[] = [];
    const type = getCppType(this.type.getKind());
    const capitalizedName = capitalizeName(this.name);
    // getter
    signatures.push({
      returnType: type,
      rawName: this.name,
      name: `get${capitalizedName}`,
      parameters: [],
      type: 'getter',
    });
    if (!this.isReadonly) {
      // setter
      signatures.push({
        returnType: 'void',
        rawName: this.name,
        name: `set${capitalizedName}`,
        parameters: [{ type: type, name: this.name }],
        type: 'setter',
      });
    }
    return signatures;
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        const signatures = this.cppSignatures;
        const codeLines = signatures.map((s) => {
          const params = s.parameters.map((p) => `${p.type} ${p.name}`);
          return `virtual ${s.returnType} ${s.name}(${params.join(', ')})`;
        });
        return codeLines.join('\n');
      default:
        throw new Error(
          `Language ${language} is not yet supported for properties!`
        );
    }
  }
}

class Parameter implements CodeNode {
  readonly name: string;
  readonly type: TypeNode;

  constructor(param: ParameterDeclaration) {
    this.name = getNodeName(param);
    this.type = param.getTypeNodeOrThrow();
  }

  get cppSignature(): CppValueSignature {
    const cppType = getCppType(this.type.getKind());
    return {
      name: this.name,
      type: cppType,
    };
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        const cppSignature = this.cppSignature;
        return `${cppSignature.type} ${cppSignature.name}`;
      default:
        throw new Error(
          `Language ${language} is not yet supported for parameters!`
        );
    }
  }
}

class Method implements CodeNode {
  readonly name: string;
  readonly returnType: TypeNode;
  readonly parameters: Parameter[];

  constructor(prop: MethodSignature) {
    this.name = getNodeName(prop);
    this.returnType = prop.getReturnTypeNodeOrThrow();
    this.parameters = prop.getParameters().map((p) => new Parameter(p));
  }

  get cppSignature(): CppMethodSignature {
    const cppType = getCppType(this.returnType.getKind());
    return {
      rawName: this.name,
      name: this.name,
      returnType: cppType,
      parameters: this.parameters.map((p) => p.cppSignature),
      type: 'method',
    };
  }

  getCode(language: Language): string {
    switch (language) {
      case 'c++':
        const signature = this.cppSignature;
        const params = signature.parameters.map((p) => `${p.type} ${p.name}`);
        return `virtual ${signature.returnType} ${signature.name}(${params.join(', ')}) = 0;`;
      default:
        throw new Error(
          `Language ${language} is not yet supported for property getters!`
        );
    }
  }
}

function getCppType(syntax: ts.SyntaxKind): string {
  const cppType = typeMap[syntax];
  if (cppType == null) {
    console.warn(
      `⚠️  Type ${syntax} cannot be represented in C++! It is now just a "???".`
    );
    return '???';
  }
  return cppType;
}

export function createPlatformSpec<
  TPlatform extends Platform,
  TLanguage extends PlatformSpec[TPlatform],
>(
  module: InterfaceDeclaration,
  platform: TPlatform,
  language: TLanguage
): File[] {
  switch (platform) {
    case 'ios':
      switch (language) {
        case 'swift':
          return createAppleSwiftSpec(module);
        case 'c++':
          return createSharedCppSpec(module);
        default:
          throw new Error(`${language} is not supported on ${platform}!`);
      }
    case 'android':
      switch (language) {
        case 'kotlin':
          return createAndroidKotlinSpec(module);
        case 'c++':
          return createSharedCppSpec(module);
        default:
          throw new Error(`${language} is not supported on ${platform}!`);
      }
    default:
      throw new Error(`${platform} is not supported!`);
  }
}

function createSharedCppSpec(module: InterfaceDeclaration): File[] {
  const moduleName = getNodeName(module);

  // Properties (getters + setters)
  const properties = module
    .getChildrenOfKind(ts.SyntaxKind.PropertySignature)
    .filter((p) => p.getFirstChildByKind(ts.SyntaxKind.FunctionType) == null);
  const cppProperties = properties.map((p) => new Property(p));

  // Functions
  const functions = module.getChildrenOfKind(ts.SyntaxKind.MethodSignature);
  const cppMethods = functions.map((f) => new Method(f));

  // Generate the full header / code
  const cppHeaderCode = `
class ${moduleName}: public HybridObject {
  public:
    // Constructor
    explicit Person(): HybridObject("Person") { }

  public:
    // Properties
    ${joinToIndented(cppProperties.map((p) => p.getCode('c++')))}

  public:
    // Methods
    ${joinToIndented(cppMethods.map((m) => m.getCode('c++')))}

  private:
    // Hybrid Setup
    void loadHybridMethods() override;
};
    `;

  // Each C++ method needs to be registered in the HybridObject - that's getters, setters and normal methods.
  const registrations: string[] = [];
  const signatures = [
    ...cppProperties.flatMap((p) => p.cppSignatures),
    ...cppMethods.map((m) => m.cppSignature),
  ];
  for (const signature of signatures) {
    let registerMethod: string;
    switch (signature.type) {
      case 'getter':
        registerMethod = 'registerHybridGetter';
        break;
      case 'setter':
        registerMethod = 'registerHybridSetter';
        break;
      case 'method':
        registerMethod = 'registerHybridMethod';
        break;
      default:
        throw new Error(`Invalid C++ Signature Type: ${signature.type}!`);
    }
    registrations.push(
      `${registerMethod}("${signature.rawName}", &${moduleName}::${signature.name}, this);`
    );
  }

  const cppBodyCode = `
#include "${moduleName}.hpp"

void Person::loadHybridMethods() {
  ${joinToIndented(registrations, '  ')}
}
    `;

  const files: File[] = [];
  files.push({
    content: cppHeaderCode,
    language: 'c++',
    name: `${moduleName}.hpp`,
  });
  files.push({
    content: cppBodyCode,
    language: 'c++',
    name: `${moduleName}.cpp`,
  });
  return files;
}

function createAppleSwiftSpec(_module: InterfaceDeclaration): File[] {
  throw new Error(`Swift for Apple/iOS is not yet implemented!`);
}

function createAndroidKotlinSpec(_module: InterfaceDeclaration): File[] {
  throw new Error(`Kotlin for Android is not yet implemented!`);
}
