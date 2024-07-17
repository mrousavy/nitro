import { Project, ts } from 'ts-morph'
import { getPlatformSpec, type Platform } from './getPlatformSpecs.js'
import { createPlatformSpec } from './createPlatformSpec.js'
import { promises as fs } from 'fs'
import path from 'path'
import { getNodeName } from './getNodeName.js'
import { getBaseDirectory, prettifyDirectory } from './getCurrentDir.js'

const start = performance.now()
let targetSpecs = 0
let generatedSpecs = 0

// This is where nitrogen starts looking for files. Either cwd(), or user-passed path (arg[0])
const baseDirectory = getBaseDirectory()

// The TS project
const project = new Project({})
project.addSourceFilesAtPaths('**/*.nitro.ts')

// Loop through all source files to log them
console.log(`🚀  Nitrogen runs at ${baseDirectory}`)
for (const dir of project.getDirectories()) {
  const specs = dir.getSourceFiles().length
  const relativePath = prettifyDirectory(dir.getPath())
  console.log(
    `    🔍  Nitrogen found ${specs} spec${specs === 1 ? '' : 's'} in ${relativePath}`
  )
}

// If no source files are found, we can exit
if (project.getSourceFiles().length === 0) {
  console.log(
    "❌  Nitrogen didn'nt find any spec files! " +
      'To create a Nitrous Module, create a file with the ".nitro.ts" suffix ' +
      'and export an interface that extends HybridObject<T>.'
  )
  process.exit()
}

const outFolder = path.join(baseDirectory, 'nitrogen', 'generated')
// Clean output folder before writing to it
await fs.rm(outFolder, { force: true, recursive: true })

for (const sourceFile of project.getSourceFiles()) {
  console.log(`⏳  Parsing ${sourceFile.getBaseName()}...`)

  const startedWithSpecs = generatedSpecs

  // Find all interfaces in the given file
  const interfaces = sourceFile.getChildrenOfKind(
    ts.SyntaxKind.InterfaceDeclaration
  )
  for (const module of interfaces) {
    let moduleName = '[Unknown Module]'
    try {
      // Get name of interface (= our module name)
      moduleName = module.getName()

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
          `⚠️   ${moduleName} does not declare any platforms in HybridObject<T> - nothing can be generated.`
        )
        continue
      }

      targetSpecs++

      console.log(
        `    ⚙️   Generating specs for HybridObject "${moduleName}"...`
      )
      for (const platform of platforms) {
        const language = platformSpec[platform]!
        const files = createPlatformSpec(module, platform, language)
        console.log(`          ${platform}: Generating ${language} code...`)

        for (const file of files) {
          const filepath = path.join(
            outFolder,
            platform,
            file.language,
            file.name
          )
          console.log(`            Creating ${file.name}...`)

          const dir = path.dirname(filepath)
          // Create directory if it doesn't exist yet
          await fs.mkdir(dir, { recursive: true })

          // Write file
          await fs.writeFile(filepath, file.content.trim(), 'utf8')
        }
      }
      generatedSpecs++
    } catch (error) {
      console.error(`    ❌  Failed to generate spec for ${moduleName}!`, error)
    }
  }

  if (generatedSpecs === startedWithSpecs) {
    console.log(`    ❌  No specs found in ${sourceFile.getBaseName()}!`)
  }
}

const end = performance.now()
console.log(
  `🎉  Generated ${generatedSpecs}/${targetSpecs} HybridObject${generatedSpecs === 1 ? '' : 's'} in ${(end - start).toFixed(0)}ms!`
)
console.log('💡  Your code is in ./nitrogen/generated')
