import { Project } from 'ts-morph'
import {
  extendsHybridObject,
  isHybridView,
  getHybridObjectPlatforms,
  getHybridViewPlatforms,
  type Platform,
} from './getPlatformSpecs.js'
import { generatePlatformFiles } from './createPlatformSpec.js'
import path from 'path'
import { prettifyDirectory } from './prettifyDirectory.js'
import {
  capitalizeName,
  errorToString,
  filterDuplicateFiles,
  indent,
  NITROGEN_VERSION,
} from './utils.js'
import { writeFile } from './writeFile.js'
import chalk from 'chalk'
import { groupByPlatform, type SourceFile } from './syntax/SourceFile.js'
import { Logger } from './Logger.js'
import { NitroConfig } from './config/NitroConfig.js'
import { createIOSAutolinking } from './autolinking/createIOSAutolinking.js'
import { createAndroidAutolinking } from './autolinking/createAndroidAutolinking.js'
import type { Autolinking } from './autolinking/Autolinking.js'
import { createGitAttributes } from './createGitAttributes.js'
import type { PlatformSpec } from 'react-native-nitro-modules'

interface NitrogenOptions {
  baseDirectory: string
  outputDirectory: string
}

interface NitrogenResult {
  generatedFiles: string[]
  targetSpecsCount: number
  generatedSpecsCount: number
}

export async function runNitrogen({
  baseDirectory,
  outputDirectory,
}: NitrogenOptions): Promise<NitrogenResult> {
  let targetSpecs = 0
  let generatedSpecs = 0

  // Create the TS project
  const project = new Project({
    compilerOptions: {
      strict: true,
      strictNullChecks: true,
      noUncheckedIndexedAccess: true,
    },
  })

  const ignorePaths = NitroConfig.getIgnorePaths()
  const globPattern = [path.join(baseDirectory, '**', '*.nitro.ts')]
  ignorePaths.forEach((ignorePath) => {
    globPattern.push('!' + path.join(baseDirectory, ignorePath))
  })
  project.addSourceFilesAtPaths(globPattern)

  // Loop through all source files to log them
  Logger.info(
    chalk.reset(
      `🚀  Nitrogen ${chalk.bold(NITROGEN_VERSION)} runs at ${chalk.underline(prettifyDirectory(baseDirectory))}`
    )
  )
  for (const dir of project.getDirectories()) {
    const specs = dir.getSourceFiles().length
    const relativePath = prettifyDirectory(dir.getPath())
    Logger.info(
      `    🔍  Nitrogen found ${specs} spec${specs === 1 ? '' : 's'} in ${chalk.underline(relativePath)}`
    )
  }

  // If no source files are found, we can exit
  if (project.getSourceFiles().length === 0) {
    const searchDir = prettifyDirectory(
      path.join(path.resolve(baseDirectory), '**', '*.nitro.ts')
    )
    Logger.error(
      `❌  Nitrogen didn't find any spec files in ${chalk.underline(searchDir)}! ` +
        `To create a Nitro Module, create a TypeScript file with the "${chalk.underline('.nitro.ts')}" suffix ` +
        'and export an interface that extends HybridObject<T>.'
    )
    process.exit()
  }

  const usedPlatforms: Platform[] = []
  const filesAfter: string[] = []
  const writtenFiles: SourceFile[] = []

  for (const sourceFile of project.getSourceFiles()) {
    Logger.info(`⏳  Parsing ${sourceFile.getBaseName()}...`)

    const startedWithSpecs = generatedSpecs

    // Find all interfaceDeclarations in the given file
    const declarations = [
      ...sourceFile.getInterfaces(),
      ...sourceFile.getTypeAliases(),
    ]
    for (const declaration of declarations) {
      let typeName = declaration.getName()
      try {
        let platformSpec: PlatformSpec
        if (isHybridView(declaration.getType())) {
          // Hybrid View Props
          const targetPlatforms = getHybridViewPlatforms(declaration)
          if (targetPlatforms == null) {
            // It does not extend HybridView, continue..
            continue
          }
          platformSpec = targetPlatforms
        } else if (extendsHybridObject(declaration.getType(), true)) {
          // Hybrid View
          const targetPlatforms = getHybridObjectPlatforms(declaration)
          if (targetPlatforms == null) {
            // It does not extend HybridObject, continue..
            continue
          }
          platformSpec = targetPlatforms
        } else {
          continue
        }

        const platforms = Object.keys(platformSpec) as Platform[]

        if (platforms.length === 0) {
          Logger.warn(
            `⚠️   ${typeName} does not declare any platforms in HybridObject<T> - nothing can be generated.`
          )
          continue
        }

        targetSpecs++

        Logger.info(
          `    ⚙️   Generating specs for HybridObject "${chalk.bold(typeName)}"...`
        )

        // Create all files and throw it into a big list
        const allFiles = platforms
          .flatMap((p) => {
            usedPlatforms.push(p)
            const language = platformSpec[p]!
            return generatePlatformFiles(declaration.getType(), language)
          })
          .filter(filterDuplicateFiles)
        // Group the files by platform ({ ios: [], android: [], shared: [] })
        const filesPerPlatform = groupByPlatform(allFiles)
        // Loop through each platform one by one so that it has some kind of order (per-platform)
        for (const [p, files] of Object.entries(filesPerPlatform)) {
          const platform = p as SourceFile['platform']
          const language =
            platform === 'shared' ? 'c++' : platformSpec[platform]
          if (language == null) {
            // if the language was never specified in the spec, skip it
            continue
          }
          if (files.length === 0) {
            // if no files exist on this platform, skip it
            continue
          }

          Logger.info(
            `        ${chalk.dim(platform)}: Generating ${capitalizeName(language)} code...`
          )
          // Write the actual files for this specific platform.
          for (const file of files) {
            const basePath = path.join(
              outputDirectory,
              file.platform,
              file.language
            )
            const actualPath = await writeFile(basePath, file)
            filesAfter.push(actualPath)
            writtenFiles.push(file)
          }
        }

        // Done!
        generatedSpecs++
      } catch (error) {
        const message = indent(errorToString(error), '    ')
        Logger.error(
          chalk.redBright(
            `        ❌  Failed to generate spec for ${typeName}! ${message}`
          )
        )
        process.exitCode = 1
      }
    }

    if (generatedSpecs === startedWithSpecs) {
      Logger.error(
        chalk.redBright(
          `    ❌  No specs found in ${sourceFile.getBaseName()}!`
        )
      )
    }
  }

  // Autolinking
  Logger.info(`⛓️   Setting up build configs for autolinking...`)

  const autolinkingFiles: Autolinking[] = []

  if (usedPlatforms.includes('ios')) {
    autolinkingFiles.push(createIOSAutolinking())
  }
  if (usedPlatforms.includes('android')) {
    autolinkingFiles.push(createAndroidAutolinking(writtenFiles))
  }

  for (const autolinking of autolinkingFiles) {
    Logger.info(
      `    Creating autolinking build setup for ${chalk.dim(autolinking.platform)}...`
    )
    for (const file of autolinking.sourceFiles) {
      const basePath = path.join(outputDirectory, file.platform)
      const actualPath = await writeFile(
        basePath,
        file as unknown as SourceFile
      )
      filesAfter.push(actualPath)
    }
  }

  try {
    // write a .gitattributes file
    const markAsGenerated = NitroConfig.getGitAttributesGeneratedFlag()
    const file = await createGitAttributes(markAsGenerated, outputDirectory)
    filesAfter.push(file)
  } catch {
    Logger.error(`❌ Failed to write ${chalk.dim(`.gitattributes`)}!`)
  }

  return {
    generatedFiles: filesAfter,
    targetSpecsCount: targetSpecs,
    generatedSpecsCount: generatedSpecs,
  }
}
