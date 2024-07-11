import type { PlatformSpec } from 'react-native-nitro-modules';
import type { Language, Platform } from './getPlatformSpecs.js';
import type { InterfaceDeclaration, Node } from 'ts-morph';
import { ts } from 'ts-morph';
import { getInterfaceName } from './getInterfaceName.js';

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

function getTypeOfChild(child: Node<ts.Node>): ts.SyntaxKind {
  return child.getLastChildOrThrow().getKind();
}

function createSharedCppSpec(module: InterfaceDeclaration): File[] {
  const moduleName = getInterfaceName(module);

  const cppProperties: string[] = [];

  const properties = module
    .getChildrenOfKind(ts.SyntaxKind.PropertySignature)
    .filter((p) => p.getFirstChildByKind(ts.SyntaxKind.FunctionType) == null);
  for (const prop of properties) {
    const name = prop
      .getLastChildByKindOrThrow(ts.SyntaxKind.Identifier)
      .getText();
    const isReadonly =
      prop.getFirstChildByKind(ts.SyntaxKind.ReadonlyKeyword) != null;
    const type = getTypeOfChild(prop);
    const cppType = getCppType(type);

    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    cppProperties.push(`virtual ${cppType} get${capitalizedName}() = 0;`);

    if (!isReadonly) {
      cppProperties.push(
        `virtual void set${capitalizedName}(${cppType} value) = 0;`
      );
    }
  }

  const cppMethods: string[] = [];

  const functions = module.getChildrenOfKind(ts.SyntaxKind.MethodSignature);
  for (const func of functions) {
    const name = func
      .getLastChildByKindOrThrow(ts.SyntaxKind.Identifier)
      .getText();
    const returnType = getTypeOfChild(func);
    const returnTypeCpp = getCppType(returnType);
    const parameters = func
      .getChildrenOfKind(ts.SyntaxKind.Parameter)
      .map((p) => {
        const parameterName = p
          .getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier)
          .getText();
        const type = getTypeOfChild(p);
        const cppType = getCppType(type);
        return `${cppType} ${parameterName}`;
      });

    cppMethods.push(
      `virtual ${returnTypeCpp} ${name}(${parameters.join(', ')}) = 0;`
    );
  }

  let cppCode = `
class ${moduleName}: public HybridObject {
  public:
    // Properties
    ${cppProperties.join('\n    ')}

  public:
    // Methods
    ${cppMethods.join('\n    ')}
};
    `;

  const files: File[] = [];
  files.push({
    content: cppCode,
    language: 'c++',
    name: `${moduleName}.hpp`,
  });
  return files;
}

function createAppleSwiftSpec(_module: InterfaceDeclaration): File[] {
  throw new Error(`Swift for Apple/iOS is not yet implemented!`);
}

function createAndroidKotlinSpec(_module: InterfaceDeclaration): File[] {
  throw new Error(`Kotlin for Android is not yet implemented!`);
}
