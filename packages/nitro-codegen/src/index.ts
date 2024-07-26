#!/usr/bin/env node

import { Project } from 'ts-morph'
import { getPlatformSpec, type Platform } from './getPlatformSpecs.js'
import { generatePlatformFiles } from './createPlatformSpec.js'
import { promises as fs } from 'fs'
import path from 'path'
import { getBaseDirectory, prettifyDirectory } from './getCurrentDir.js'
import { capitalizeName, errorToString, indent } from './stringUtils.js'
import { writeFile } from './writeFile.js'
import chalk from 'chalk'

const start = performance.now()
let targetSpecs = 0
let generatedSpecs = 0

// This is where nitrogen starts looking for files. Either cwd(), or user-passed path (arg[0])
const baseDirectory = getBaseDirectory()

// The TS project
const project = new Project({})
project.addSourceFilesAtPaths('**/*.nitro.ts')

// Loop through all source files to log them
console.log(
  chalk.reset(`🚀  Nitrogen runs at ${prettifyDirectory(baseDirectory)}`)
)
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
const currentFiles = await fs.readdir(outFolder, {
  recursive: true,
})
const filesBefore = currentFiles.map((f) => path.join(outFolder, f))
const filesAfter: string[] = []

for (const sourceFile of project.getSourceFiles()) {
  console.log(`⏳  Parsing ${sourceFile.getBaseName()}...`)

  const startedWithSpecs = generatedSpecs

  // Find all interfaces in the given file
  const interfaces = sourceFile.getInterfaces()
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
          const typeName = type.getText()
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
        `    ⚙️   Generating specs for HybridObject "${chalk.bold(moduleName)}"...`
      )
      // Generate platform specific code (C++/Swift/Kotlin/...)
      for (const platform of platforms) {
        const language = platformSpec[platform]!
        const files = generatePlatformFiles(module, language)
        console.log(
          `        ${chalk.dim(platform)}: Generating ${capitalizeName(language)} code...`
        )

        for (const file of files) {
          const basePath = path.join(outFolder, file.platform, file.language)
          await writeFile(basePath, file)
          filesAfter.push(path.join(basePath, file.name))
        }
      }

      // Done!
      generatedSpecs++
    } catch (error) {
      const message = indent(errorToString(error), '    ')
      console.error(
        `    ❌  Failed to generate spec for ${moduleName}! ${message}`
      )
    }
  }

  if (generatedSpecs === startedWithSpecs) {
    console.log(`    ❌  No specs found in ${sourceFile.getBaseName()}!`)
  }
}

const end = performance.now()
const timeS = ((end - start) / 1000).toFixed(1)
console.log(
  `🎉  Generated ${generatedSpecs}/${targetSpecs} HybridObject${generatedSpecs === 1 ? '' : 's'} in ${timeS}s!`
)
console.log(`💡  Your code is in ${prettifyDirectory(outFolder)}`)

const addedFiles = filesAfter.filter((f) => !filesBefore.includes(f))
const removedFiles = filesBefore.filter((f) => !filesAfter.includes(f))
if (addedFiles.length > 0 || removedFiles.length > 0) {
  let text = ''
  if (addedFiles.length > 0 && removedFiles.length === 0) {
    text = `Added ${addedFiles.length} files`
  } else if (addedFiles.length === 0 && removedFiles.length > 0) {
    text = `Removed ${removedFiles.length} files`
  } else {
    text = `Added ${addedFiles.length} files and removed ${removedFiles.length} files`
  }

  console.log(
    `‼️   ${text} - ${chalk.bold('you need to run `pod install`/sync gradle to update files!')}`
  )
}
const promises = removedFiles.map(async (file) => {
  const stat = await fs.stat(file)
  if (stat.isFile()) {
    await fs.rm(file)
  }
})
await Promise.all(promises)
