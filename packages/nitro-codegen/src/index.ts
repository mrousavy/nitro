import { Project, ts } from 'ts-morph'
import { getPlatformSpec, type Platform } from './getPlatformSpecs.js'
import { createPlatformSpec } from './createPlatformSpec.js'
import { getNodeName } from './getNodeName.js'
import fs from 'fs'
import path from 'path'

const start = performance.now()
let targetSpecs = 0
let generatedSpecs = 0

const project = new Project({})
const sourceFile = project.addSourceFileAtPath('./src/Person.nitro.ts')

// Find all interfaces in the given file
const interfaces = sourceFile.getChildrenOfKind(
  ts.SyntaxKind.InterfaceDeclaration
)
for (const module of interfaces) {
  let moduleName = '[Unknown Module]'
  try {
    // Get name of interface (= our module name)
    moduleName = getNodeName(module)

    // Find out if it extends HybridObject
    const heritageClauses = module.getHeritageClauses()
    const platformSpecs = heritageClauses.map((clause) => {
      const types = clause.getTypeNodes()
      for (const type of types) {
        const typeName = getNodeName(type)
        if (!typeName.startsWith('HybridObject')) {
          continue
        }
        const genericArguments = type.getTypeArguments()
        const platformSpecsArgument = genericArguments[0]
        if (genericArguments.length !== 1 || platformSpecsArgument == null) {
          throw new Error(
            `${moduleName} does not properly extend HybridObject<T> - ${typeName} does not have a single generic type argument for platform spec languages.`
          )
        }
        return getPlatformSpec(moduleName, platformSpecsArgument)
      }
      return undefined
    })
    const platformSpec = platformSpecs.find((s) => s != null)
    if (platformSpec == null) {
      // Skip this interface if it doesn't extend HybridObject
      continue
    }

    const platforms = Object.keys(platformSpec) as Platform[]
    if (platforms.length === 0) {
      console.warn(
        `⚠️  ${moduleName} does not declare any platforms in HybridObject<T> - nothing can be generated.`
      )
      continue
    }

    targetSpecs++

    const outFolder = path.join('nitrogen', 'generated')
    if (fs.existsSync(outFolder)) {
      // Clean output folder before writing to it
      fs.rmSync(outFolder, { force: true, recursive: true })
    }

    console.log(`⏳  Generating specs for HybridObject "${moduleName}"...`)
    for (const platform of platforms) {
      const language = platformSpec[platform]!
      const files = createPlatformSpec(module, platform, language)
      console.log(`    ${platform}: Generating ${language} code...`)

      for (const file of files) {
        const filepath = path.join(
          outFolder,
          platform,
          file.language,
          file.name
        )
        console.log(`      Creating ${file.name}...`)

        const dir = path.dirname(filepath)
        if (!fs.existsSync(dir)) {
          // Create directory if it doesn't exist yet
          fs.mkdirSync(dir, { recursive: true })
        }

        // Write file
        fs.writeFileSync(filepath, file.content.trim(), 'utf8')
      }
    }
    generatedSpecs++
  } catch (error) {
    console.error(`❌  Failed to generate spec for ${moduleName}!`, error)
  }
}

const end = performance.now()
console.log(
  `Generated ${generatedSpecs}/${targetSpecs} HybridObject${generatedSpecs === 1 ? '' : 's'} in ${(end - start).toFixed(0)}ms! 🎉`
)
console.log('(Your code is in ./nitrogen/generated)')
