import type { PlatformSpec } from 'react-native-nitro-modules'
import type { InterfaceDeclaration, Type } from 'ts-morph'
import { Symbol } from 'ts-morph'

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

function getPlatformSpec(typeName: string, platformSpecs: Type): PlatformSpec {
  const result: PlatformSpec = {}

  // Properties (ios, android)
  const properties = platformSpecs.getProperties()
  for (const property of properties) {
    // Property name (ios, android)
    const platform = property.getName()
    if (!isValidPlatform(platform)) {
      console.warn(
        `    ⚠️   ${typeName} does not properly extend HybridObject<T> - "${platform}" is not a valid Platform! ` +
          `Valid platforms are: [${allPlatforms.join(', ')}]`
      )
      continue
    }

    // Value (swift, kotlin, c++)
    const language = getLiteralValue(property)
    if (!isValidLanguage(language)) {
      console.warn(
        `    ⚠️   ${typeName}: Language ${language} is not a valid language for ${platform}! ` +
          `Valid languages are: [${platformLanguages[platform].join(', ')}]`
      )
      continue
    }

    // Double-check that language works on this platform (android: kotlin/c++, ios: swift/c++)
    if (!isValidLanguageForPlatform(language, platform)) {
      console.warn(
        `    ⚠️   ${typeName}: Language ${language} is not a valid language for ${platform}! ` +
          `Valid languages are: [${platformLanguages[platform].join(', ')}]`
      )
      continue
    }

    // @ts-expect-error because TypeScript isn't smart enough yet to correctly cast after the `isValidLanguageForPlatform` check.
    result[platform] = language
  }

  return result
}

export function isDirectlyHybridObject(type: Type): boolean {
  const symbol = type.getSymbol() ?? type.getAliasSymbol()
  if (symbol?.getName() === 'HybridObject') {
    return true
  }
  return false
}

export function extendsHybridObject(type: Type, recursive: boolean): boolean {
  for (const base of type.getBaseTypes()) {
    const isHybrid = isDirectlyHybridObject(base)
    if (isHybrid) {
      return true
    }
    if (recursive) {
      const baseExtends = extendsHybridObject(base, recursive)
      if (baseExtends) {
        return true
      }
    }
  }
  return false
}

function findHybridObjectBase(type: Type): Type | undefined {
  for (const base of type.getBaseTypes()) {
    const symbol = base.getSymbol() ?? base.getAliasSymbol()
    if (symbol?.getName() === 'HybridObject') {
      return base
    }
    const baseBase = findHybridObjectBase(base)
    if (baseBase != null) {
      return baseBase
    }
  }
  return undefined
}

/**
 * If the given interface ({@linkcode declaration}) extends `HybridObject`,
 * this method returns the platforms it exists on.
 * If it doesn't extend `HybridObject`, this returns `undefined`.
 */
export function getHybridObjectPlatforms(
  declaration: InterfaceDeclaration
): PlatformSpec | undefined {
  const base = findHybridObjectBase(declaration.getType())
  if (base == null) {
    // this type does not extend `HybridObject`.
    return undefined
  }

  const genericArguments = base.getTypeArguments()
  const platformSpecsArgument = genericArguments[0]
  if (platformSpecsArgument == null) {
    // it uses `HybridObject` without generic arguments. This defaults to C++
    return { android: 'c++', ios: 'c++' }
  }

  return getPlatformSpec(declaration.getName(), platformSpecsArgument)
}
