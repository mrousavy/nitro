import type { PlatformSpec } from 'react-native-nitro-modules';
import { Node, Project, ts } from 'ts-morph';

const project = new Project({});
const file = project.addSourceFileAtPath('./src/Person.nitro.ts');

const typeMap = {
  [ts.SyntaxKind.VoidKeyword]: 'void',
  [ts.SyntaxKind.NumberKeyword]: 'double',
  [ts.SyntaxKind.BooleanKeyword]: 'bool',
  [ts.SyntaxKind.StringKeyword]: 'std::string',
  [ts.SyntaxKind.BigIntKeyword]: 'int64_t',
} as const;

type LanguageApple = PlatformSpec['ios'];
type LanguageAndroid = PlatformSpec['android'];
type Language = Exclude<LanguageApple | LanguageAndroid, undefined>;

function isValidLanguage(language: string): language is Language {
  switch (language as Language) {
    case 'c++':
    case 'kotlin':
    case 'swift':
      return true;
    default:
      return false;
  }
}

type Platform = keyof PlatformSpec;

function isValidPlatform(platform: string): platform is Platform {
  switch (platform as Platform) {
    case 'android':
    case 'ios':
      return true;
    default:
      return false;
  }
}

// Find all interfaces in the given file
const interfaces = file.getChildrenOfKind(ts.SyntaxKind.InterfaceDeclaration);
for (const module of interfaces) {
  // Get name of interface (= our module name)
  const moduleName = module
    .getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier)
    .getText();

  // Prepare the languages we are going to generate
  const languages: Language[] = [];

  // Find out if it extends HybridObject
  const heritageClauses = module.getHeritageClauses();
  let extendsHybridObject = false;
  for (const clause of heritageClauses) {
    const types = clause.getTypeNodes();
    for (const type of types) {
      const typeName = type.getText();
      const genericArguments = type.getTypeArguments();
      const platformSpecs = genericArguments[0];
      if (genericArguments.length !== 1 || platformSpecs == null) {
        throw new Error(
          `${moduleName} does not properly extend HybridObject<T> - ${typeName} does not have a single generic type argument for platform spec languages.`
        );
      }
      const platformSpec = platformSpecs.getChildrenOfKind(
        ts.SyntaxKind.SyntaxList
      );
      for (const spec of platformSpec) {
        const property = spec.getFirstChildByKindOrThrow(
          ts.SyntaxKind.PropertySignature
        );
        const platform = property.getText();
        if (!isValidPlatform(platform)) {
          console.warn(
            `⚠️  ${moduleName} does not properly extend HybridObject<T> - "${platform}" is not a valid Platform!`
          );
          continue;
        }
        const literal = property.getFirstChildByKindOrThrow(
          ts.SyntaxKind.LiteralType
        );
        const languageLiteral = literal.getFirstChildByKindOrThrow(
          ts.SyntaxKind.StringLiteral
        );
        const language = languageLiteral.getText();
        if (!isValidLanguage(language)) {
          console.warn(
            `⚠️  ${moduleName}: Language ${language} is not a valid language for ${platform}!`
          );
          continue;
        }
        console.log(languageLiteral.getLiteralText());
        console.log(spec.getText());
      }

      console.log(typeName);
      if (typeName.startsWith('HybridObject')) {
        extendsHybridObject = true;
      }
    }
  }
  if (!extendsHybridObject) {
    // Skip this interface if it doesn't extend HybridObject
    continue;
  }
  if (languages.length === 0) {
    console.warn(
      `⚠️  ${moduleName} does not properly extend HybridObject<T> - no platforms/languages were declared so nothing can be generated!`
    );
    continue;
  }

  function getTypeOfChild(child: Node<ts.Node>): ts.SyntaxKind {
    return child.getLastChildOrThrow().getKind();
  }

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
    // @ts-expect-error
    const cppType = typeMap[type];

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
    // @ts-expect-error
    const returnTypeCpp = typeMap[returnType];
    const parameters = func
      .getChildrenOfKind(ts.SyntaxKind.Parameter)
      .map((p) => {
        const name = p
          .getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier)
          .getText();
        const type = getTypeOfChild(p);
        // @ts-expect-error
        const cppType = typeMap[type];
        return `${cppType} ${name}`;
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

  console.log(`--------------------- ${moduleName}.hpp --------------------- `);
  console.log(cppCode);
  console.log(`--------------------- ${moduleName}.hpp --------------------- `);
}
