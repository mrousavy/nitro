import type { PlatformSpec } from 'react-native-nitro-modules';
import type { TypeNode } from 'ts-morph';
import { ts } from 'ts-morph';

type Platform = keyof Required<PlatformSpec>;
type Language = Required<PlatformSpec>[keyof PlatformSpec];

const platformLanguages: { [K in Platform]: Language[] } = {
  ios: ['swift', 'c++'],
  android: ['kotlin', 'c++'],
};
const platforms = Object.keys(platformLanguages) as Platform[];
const languages = Object.values(platformLanguages).flatMap((l) => l);

function isValidLanguage(language: string): language is Language {
  return languages.includes(language as Language);
}

function isValidPlatform(platform: string): platform is Platform {
  return platform.includes(platform as Platform);
}

// TODO: The type casting result here doesn't really work in TS.
function isValidLanguageForPlatform(
  language: Language,
  platform: Platform
): language is Required<PlatformSpec>[typeof platform] {
  return platformLanguages[platform].includes(language);
}

export function getPlatformSpec(
  moduleName: string,
  platformSpecs: TypeNode<ts.TypeNode>
): PlatformSpec {
  const platformSpec = platformSpecs.getChildrenOfKind(
    ts.SyntaxKind.SyntaxList
  );

  const result: PlatformSpec = {};

  for (const spec of platformSpec) {
    // Property
    const property = spec.getFirstChildByKindOrThrow(
      ts.SyntaxKind.PropertySignature
    );

    // Identifier (ios, android)
    const identifier = property.getFirstChildByKindOrThrow(
      ts.SyntaxKind.Identifier
    );
    const platform = identifier.getText();
    if (!isValidPlatform(platform)) {
      console.warn(
        `⚠️  ${moduleName} does not properly extend HybridObject<T> - "${platform}" is not a valid Platform! ` +
          `Valid platforms are: [${platforms.join(', ')}]`
      );
      continue;
    }

    // Value (swift, kotlin, c++)
    const literal = property.getFirstChildByKindOrThrow(
      ts.SyntaxKind.LiteralType
    );
    const languageLiteral = literal.getFirstChildByKindOrThrow(
      ts.SyntaxKind.StringLiteral
    );
    const language = languageLiteral.getLiteralText();
    if (!isValidLanguage(language)) {
      console.warn(
        `⚠️  ${moduleName}: Language ${language} is not a valid language for ${platform}! ` +
          `Valid languages are: [${platformLanguages[platform].join(', ')}]`
      );
      continue;
    }

    if (!isValidLanguageForPlatform(language, platform)) {
      console.warn(
        `⚠️  ${moduleName}: Language ${language} is not a valid language for ${platform}! ` +
          `Valid languages are: [${platformLanguages[platform].join(', ')}]`
      );
      continue;
    }

    // @ts-expect-error because TypeScript isn't smart enough yet to correctly cast after the `isValidLanguageForPlatform` check.
    result[platform] = language;
  }

  return result;
}
