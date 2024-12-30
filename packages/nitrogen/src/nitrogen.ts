import { Project } from 'ts-morph'
import {
  extendsHybridObject,
  extendsHybridView,
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
} from './utils.js'
import { writeFile } from './writeFile.js'
import chalk from 'chalk'
import { groupByPlatform, type SourceFile } from './syntax/SourceFile.js'
import { Logger } from './Logger.js'
import { NitroConfig } from './config/NitroConfig.js'
import { createIOSAutolinking } from './autolinking/createIOSAutolinking.js'
import { createAndroidAutolinking } from './autolinking/createAndroidAutolinking.js'
import type { Autolinking } from './autolinking/Autolinking.js'
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
  console.log(
    chalk.reset(
      `🚀  Nitrogen runs at ${chalk.underline(prettifyDirectory(baseDirectory))}`
    )
  )
  for (const dir of project.getDirectories()) {
    const specs = dir.getSourceFiles().length
    const relativePath = prettifyDirectory(dir.getPath())
    console.log(
      `    🔍  Nitrogen found ${specs} spec${specs === 1 ? '' : 's'} in ${chalk.underline(relativePath)}`
    )
  }

  // If no source files are found, we can exit
  if (project.getSourceFiles().length === 0) {
    const searchDir = prettifyDirectory(
      path.join(path.resolve(baseDirectory), '**', '*.nitro.ts')
    )
    console.log(
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
    console.log(`⏳  Parsing ${sourceFile.getBaseName()}...`)

    const startedWithSpecs = generatedSpecs

    // Find all interfaces or types in the given file
    const types = [
      ...sourceFile.getInterfaces(),
      ...sourceFile.getTypeAliases(),
    ]
    for (const type of types) {
      console.log('---->', type.getName())
      // Get name of interface (= our module name)
      const typeName = type.getName()
      try {
        let allFiles: SourceFile[]
        let platformSpec: PlatformSpec
        if (extendsHybridObject(type.getType(), true)) {
          // Hybrid View
          const targetPlatforms = getHybridObjectPlatforms(type)
          if (targetPlatforms == null) {
            // It does not extend HybridObject, continue..
            continue
          }
          platformSpec = targetPlatforms

          const platforms = Object.keys(platformSpec) as Platform[]

          if (platforms.length === 0) {
            console.warn(
              `⚠️   ${typeName} does not declare any platforms in HybridObject<T> - nothing can be generated.`
            )
            continue
          }

          targetSpecs++

          console.log(
            `    ⚙️   Generating specs for HybridObject "${chalk.bold(typeName)}"...`
          )

          // Create all files and throw it into a big list
          allFiles = platforms
            .flatMap((p) => {
              usedPlatforms.push(p)
              const language = platformSpec[p]!
              return generatePlatformFiles(type.getType(), language)
            })
            .filter(filterDuplicateFiles)
        } else if (extendsHybridView(type.getType(), true)) {
          // Hybrid View Props
          const targetPlatforms = getHybridViewPlatforms(type)
          if (targetPlatforms == null) {
            // It does not extend HybridView, continue..
            continue
          }
          platformSpec = targetPlatforms
          targetSpecs++
          allFiles = []
        } else {
          continue
        }

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
        console.error(
          chalk.redBright(
            `        ❌  Failed to generate spec for ${typeName}! ${message}`
          )
        )
        process.exitCode = 1
      }
    }

    if (generatedSpecs === startedWithSpecs) {
      console.error(
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

  return {
    generatedFiles: filesAfter,
    targetSpecsCount: targetSpecs,
    generatedSpecsCount: generatedSpecs,
  }
}
