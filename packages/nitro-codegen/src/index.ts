import { Node, Project, ts } from 'ts-morph';
import { getPlatformSpec } from './getPlatformSpecs.js';

const project = new Project({});
const file = project.addSourceFileAtPath('./src/Person.nitro.ts');

const typeMap = {
  [ts.SyntaxKind.VoidKeyword]: 'void',
  [ts.SyntaxKind.NumberKeyword]: 'double',
  [ts.SyntaxKind.BooleanKeyword]: 'bool',
  [ts.SyntaxKind.StringKeyword]: 'std::string',
  [ts.SyntaxKind.BigIntKeyword]: 'int64_t',
} as const;

// Find all interfaces in the given file
const interfaces = file.getChildrenOfKind(ts.SyntaxKind.InterfaceDeclaration);
for (const module of interfaces) {
  // Get name of interface (= our module name)
  const moduleName = module
    .getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier)
    .getText();

  // Find out if it extends HybridObject
  const heritageClauses = module.getHeritageClauses();

  const platformSpecs = heritageClauses.map((clause) => {
    const types = clause.getTypeNodes();
    for (const type of types) {
      const identifier = type.getFirstChildByKindOrThrow(
        ts.SyntaxKind.Identifier
      );
      const typeName = identifier.getText();
      if (!typeName.startsWith('HybridObject')) {
        continue;
      }
      const genericArguments = type.getTypeArguments();
      const platformSpecsArgument = genericArguments[0];
      if (genericArguments.length !== 1 || platformSpecsArgument == null) {
        throw new Error(
          `${moduleName} does not properly extend HybridObject<T> - ${typeName} does not have a single generic type argument for platform spec languages.`
        );
      }
      return getPlatformSpec(moduleName, platformSpecsArgument);
    }
    return undefined;
  });
  const platformSpec = platformSpecs.find((s) => s != null);
  if (platformSpec == null) {
    // Skip this interface if it doesn't extend HybridObject
    continue;
  }
  console.log(`-> Generating ${platformSpec}`);

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
