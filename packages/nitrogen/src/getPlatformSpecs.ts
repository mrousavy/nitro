import type { PlatformSpec } from 'react-native-nitro-modules'
import type { InterfaceDeclaration, TypeNode } from 'ts-morph'
import { ts, Symbol } from 'ts-morph'

export type Platform = keyof Required<PlatformSpec>
export type Language = Required<PlatformSpec>[keyof PlatformSpec]

const platformLanguages: { [K in Platform]: Language[] } = {
  ios: ['swift', 'c++'],
  android: ['kotlin', 'c++'],
}
const allPlatforms = Object.keys(platformLanguages) as Platform[]
const allLanguages = Object.values(platformLanguages).flatMap((l) => l)

function isValidLanguage(language: string | undefined): language is Language {
  if (language == null) {
    return false
  }
  return allLanguages.includes(language as Language)
}

function isValidPlatform(platform: string): platform is Platform {
  return allPlatforms.includes(platform as Platform)
}

function getLiteralValue(symbol: Symbol): string | undefined {
  const value = symbol.getValueDeclaration()
  if (value == null) {
    return undefined
  }
  const type = value.getType()
  const literal = type.getLiteralValue()
  if (typeof literal === 'string') {
    return literal
  }
  return undefined
}

// TODO: The type casting result here doesn't really work in TS.
function isValidLanguageForPlatform(
  language: Language,
  platform: Platform
): language is Required<PlatformSpec>[typeof platform] {
  return platformLanguages[platform].includes(language)
}

function getPlatformSpec(
  moduleName: string,
  platformSpecs: TypeNode<ts.TypeNode>
): PlatformSpec {
  const result: PlatformSpec = {}

  // Properties (ios, android)
  const properties = platformSpecs.getType().getProperties()
  for (const property of properties) {
    // Property name (ios, android)
    const platform = property.getName()
    if (!isValidPlatform(platform)) {
      console.warn(
        `    ⚠️   ${moduleName} does not properly extend HybridObject<T> - "${platform}" is not a valid Platform! ` +
          `Valid platforms are: [${allPlatforms.join(', ')}]`
      )
      continue
    }

    // Value (swift, kotlin, c++)
    const language = getLiteralValue(property)
    if (!isValidLanguage(language)) {
      console.warn(
        `    ⚠️   ${moduleName}: Language ${language} is not a valid language for ${platform}! ` +
          `Valid languages are: [${platformLanguages[platform].join(', ')}]`
      )
      continue
    }

    // Double-check that language works on this platform (android: kotlin/c++, ios: swift/c++)
    if (!isValidLanguageForPlatform(language, platform)) {
      console.warn(
        `    ⚠️   ${moduleName}: Language ${language} is not a valid language for ${platform}! ` +
          `Valid languages are: [${platformLanguages[platform].join(', ')}]`
      )
      continue
    }

    // @ts-expect-error because TypeScript isn't smart enough yet to correctly cast after the `isValidLanguageForPlatform` check.
    result[platform] = language
  }

  return result
}

export function getHybridObjectPlatforms(
  module: InterfaceDeclaration
): PlatformSpec | undefined {
  const heritageClauses = module.getHeritageClauses()

  for (const clause of heritageClauses) {
    const types = clause.getTypeNodes()
    for (const type of types) {
      const typename = type.getText()
      if (typename.startsWith('HybridObject<')) {
        // It extends HybridObject<...>
        const genericArguments = type.getTypeArguments()
        const platformSpecsArgument = genericArguments[0]
        if (platformSpecsArgument == null) {
          throw new Error(
            `${module.getName()} does not properly extend HybridObject<T>! ${typename} does not have a single generic type argument for platform spec languages!`
          )
        }
        return getPlatformSpec(module.getName(), platformSpecsArgument)
      } else if (typename === 'HybridObject') {
        // It extends HybridObject with default type arguments
        return { android: 'c++', ios: 'c++' }
      }
    }
  }
  return undefined
}
