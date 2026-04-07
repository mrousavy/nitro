import { NitroConfig } from './config/NitroConfig.js'
import type { Language } from './getPlatformSpecs.js'
import { createFileMetadataString } from './syntax/helpers.js'
import type { SourceFile } from './syntax/SourceFile.js'

export function generateViewHostComponentGetter(
  hybridViewNames: string[]
): SourceFile {
  const moduleName = NitroConfig.current.getIosModuleName()
  const viewHostComponentGetterName = `get${moduleName}HostComponent`

  const imports = hybridViewNames.map(
    (name) => `import ${name}Config from '../json/${name}Config.json'`
  )

  const registrations = hybridViewNames.map(
    (name) =>
      `  ${name}: {\n    name: '${moduleName}${name}',\n    config: ${name}Config,\n  },`
  )

  const code = `
${createFileMetadataString(`${viewHostComponentGetterName}.ts`)}
import {
  getHostComponent,
  type HybridViewMethods,
  type HybridViewProps,
  type ViewConfig,
} from 'react-native-nitro-modules'

${imports.join('\n')}

const REGISTERED_COMPONENTS = {
${registrations.join('\n')}
} as const

export function get${moduleName}HostComponent<
  Props extends HybridViewProps,
  Methods extends HybridViewMethods,
>(
  name: keyof typeof REGISTERED_COMPONENTS
): ReturnType<typeof getHostComponent<Props, Methods>> {
  const component = REGISTERED_COMPONENTS[name]
  const config = component.config as ViewConfig<Props>
  return getHostComponent<Props, Methods>(component.name, () => config)
}
  `.trim()
  return {
    content: code,
    language: 'ts' as Language,
    name: `${viewHostComponentGetterName}.ts`,
    platform: 'shared',
    subdirectory: [],
  }
}

export function generateHybridObjectCreator(
  hybridObjectNames: string[]
): SourceFile {
  const autolinkedHybridObjects = Object.keys(
    NitroConfig.current.getAutolinkedHybridObjects()
  )
  hybridObjectNames = hybridObjectNames.filter((name) =>
    autolinkedHybridObjects.includes(name)
  )
  const moduleName = NitroConfig.current.getIosModuleName()
  const hybridObjectCreatorName = `create${moduleName}HybridObject`

  const registrations = hybridObjectNames.map(
    (name) => `  ${name}: '${moduleName}${name}',`
  )

  const code = `
${createFileMetadataString(`${hybridObjectCreatorName}.ts`)}
import { NitroModules, type HybridObject } from 'react-native-nitro-modules'

const REGISTERED_OBJECTS = {
${registrations.join('\n')}
} as const

export function create${moduleName}HybridObject<T extends HybridObject<{}>>(
  name: keyof typeof REGISTERED_OBJECTS
): ReturnType<typeof NitroModules.createHybridObject<T>> {
  return NitroModules.createHybridObject<T>(REGISTERED_OBJECTS[name])
}

  `.trim()

  return {
    content: code,
    language: 'ts' as Language,
    name: `${hybridObjectCreatorName}.ts`,
    platform: 'shared',
    subdirectory: [],
  }
}
