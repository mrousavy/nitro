import { Project, ts } from 'ts-morph';
import { getPlatformSpec, type Platform } from './getPlatformSpecs.js';
import { createPlatformSpec } from './createPlatformSpec.js';

const project = new Project({});
const sourceFile = project.addSourceFileAtPath('./src/Person.nitro.ts');

// Find all interfaces in the given file
const interfaces = sourceFile.getChildrenOfKind(
  ts.SyntaxKind.InterfaceDeclaration
);
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

  const platforms = Object.keys(platformSpec) as Platform[];
  if (platforms.length === 0) {
    console.warn(
      `⚠️  ${moduleName} does not declare any platforms in HybridObject<T> - nothing can be generated.`
    );
    continue;
  }

  for (const platform of platforms) {
    const language = platformSpec[platform]!;
    console.log(`${moduleName}: Generating ${platform} code in ${language}...`);
    const files = createPlatformSpec(module, platform, language);
    for (const file of files) {
      console.log(`vvvvvvvvvvvvvvvvvvvvv ${file.name} vvvvvvvvvvvvvvvvvvvvv`);
      console.log(file.content);
      console.log(`^^^^^^^^^^^^^^^^^^^^^ ${file.name} ^^^^^^^^^^^^^^^^^^^^^`);
    }
  }
}
