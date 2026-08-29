import fs from 'fs'
import path from 'path'
import { NitroConfig } from '../../config/NitroConfig.js'
import { getAllKnownTypes } from '../../syntax/createType.js'
import {
  createFileMetadataString,
  isNotDuplicate,
} from '../../syntax/helpers.js'
import type { SourceFile } from '../../syntax/SourceFile.js'
import { getTypeAs } from '../../syntax/types/getTypeAs.js'
import { HybridObjectType } from '../../syntax/types/HybridObjectType.js'
import { getSpmPackageName } from './getSpmPackageName.js'
import { Logger } from '../../Logger.js'

type AutolinkingFile = Omit<SourceFile, 'language'> & {
  language: 'swift' | 'c++'
}

/** Splits a path into its segments, dropping empty ones (`''`, `'.'`). */
function toSegments(relativePath: string): string[] {
  return relativePath.split(path.sep).filter((s) => s !== '' && s !== '.')
}

/**
 * Generates React Native SwiftPM (Preview) support for a Nitro Module:
 *
 * - `Package.swift` at the package root — a "self-managed" manifest for RN's
 *   SwiftPM autolinking. Because SwiftPM cannot compile Swift and C++ in one
 *   target (CocoaPods can), the module is split into an acyclic 3-target
 *   chain: `<Mod>Core` (C++ specs + user C++) ← `<Mod>` (Swift, C++ interop)
 *   ← `<Mod>SwiftBridge` (every C++/ObjC++ TU that calls INTO Swift via the
 *   Swift-generated `<Mod>-Swift.h`). The same three phases exist under
 *   CocoaPods inside its one mixed target (Swift compiles first, emits
 *   `<Mod>-Swift.h`, then the ObjC++/C++ TUs compile against it) — SwiftPM
 *   just requires each phase to be its own target.
 * - `nitrogen/generated/include/<Mod>/` — a flat tree of SYMLINKS to this
 *   module's public headers, giving SwiftPM the single `publicHeadersPath`
 *   directory it requires. The headers themselves are NOT moved, so the
 *   podspec, the Android CMake include dirs and every existing `#include`
 *   spelling stay exactly as they were.
 * - `nitrogen/generated/include-bridge/` — placeholder public-headers dir for
 *   the SwiftBridge target (each clang target needs its own disjoint one).
 *
 * This is purely ADDITIVE: CocoaPods consumption via `<Mod>+autolinking.rb`
 * is unchanged. RN's SwiftPM autolinking prefers the Package.swift when the
 * app uses `react-native spm`; CocoaPods apps never read it.
 *
 * Conventions (validated against react-native-nitro-test):
 * - The dep's react-native.config.js sets `spm.name` = iosModuleName and
 *   `spm.dependencies` = its native npm siblings.
 * - User Swift code lives in `ios/`, user C++ in `cpp/` (both optional).
 *   Swift files go to the Swift target; user C-family files go to the glue
 *   target (they may need `<Mod>-Swift.h`).
 * - `<Mod>-Swift.h` is consumed TEXTUALLY: under `swift build` SwiftPM vends
 *   it natively; under Xcode, RN's SPM sync symlinks Xcode's generated-header
 *   dir to `.spm-derived-headers/` inside the package.
 */
export function createPackageSwift(
  spmPackageName: string,
  outputDirectory: string
): AutolinkingFile[] {
  const moduleName = NitroConfig.current.getIosModuleName()
  const packageRoot = process.cwd()

  // `--out` is user-configurable, so neither the depth of the output directory
  // nor its name may be assumed here (the default is `nitrogen/generated`).
  //  - `packageRootSubdirectory` walks back from `<outputDir>/ios/` (where
  //    autolinking files are written) to the package root, where SwiftPM
  //    requires the manifest to live.
  //  - `generatedDir` is the same output directory as SwiftPM sees it:
  //    relative to the package root, always POSIX-separated.
  const generatedDirAbs = path.resolve(packageRoot, outputDirectory)
  const packageRootSubdirectory = toSegments(
    path.relative(path.join(generatedDirAbs, 'ios'), packageRoot)
  )
  const generatedDirSegments = toSegments(
    path.relative(packageRoot, generatedDirAbs)
  )
  const generatedDir = generatedDirSegments.join('/')
  if (generatedDirSegments.includes('..') || generatedDir === '') {
    // SwiftPM targets cannot reference sources outside the package, so a
    // manifest could only be written if it were broken. Skip it — CocoaPods
    // autolinking (the default) is unaffected.
    Logger.warn(
      `⚠️   Skipping Package.swift for ${moduleName}: the output directory ` +
        `("${outputDirectory}") is not inside the package root. React Native ` +
        `SwiftPM support requires nitrogen's output to live inside the package.`
    )
    return []
  }
  if (generatedDir !== 'nitrogen/generated') {
    // The consumer-side plugin (rn-spm-autolinking-plugin.cjs) stages public
    // headers from the hardcoded `nitrogen/generated/` layout.
    Logger.warn(
      `⚠️   ${moduleName} generates into "${generatedDir}" instead of ` +
        `"nitrogen/generated" — React Native SwiftPM autolinking will not ` +
        `find this module's generated headers.`
    )
  }

  const types = getAllKnownTypes('swift')
  const siblingModules = types
    .filter((t) => t.kind === 'hybrid-object')
    .map((t) => getTypeAs(t, HybridObjectType).sourceConfig)
    .filter((config) => config.getIosModuleName() !== moduleName)
    .map((config) => getSpmPackageName(config.getPackageRoot()))
    .filter((name) => name != null)
    .filter(isNotDuplicate)
    .sort()

  const listFiles = (dir: string, exts: string[]): string[] => {
    const abs = path.join(packageRoot, dir)
    if (!fs.existsSync(abs)) return []
    const out: string[] = []
    const walk = (rel: string) => {
      for (const entry of fs.readdirSync(path.join(packageRoot, rel), {
        withFileTypes: true,
      })) {
        const relPath = `${rel}/${entry.name}`
        if (entry.isDirectory()) walk(relPath)
        else if (exts.some((e) => entry.name.endsWith(e))) out.push(relPath)
      }
    }
    walk(dir)
    return out.sort()
  }
  const userSwiftSources = listFiles('ios', ['.swift'])
  const userClangSources = [
    ...listFiles('ios', ['.c', '.cpp', '.cc', '.m', '.mm']),
    ...listFiles('cpp', ['.c', '.cpp', '.cc', '.m', '.mm']),
  ]
  const hasUserCpp = fs.existsSync(path.join(packageRoot, 'cpp'))

  const hasSwiftPart = fs.existsSync(path.join(generatedDirAbs, 'ios/swift'))
  const hasGeneratedIosCpp = fs.existsSync(
    path.join(generatedDirAbs, 'ios/c++')
  )

  const quoteList = (items: string[], indentation: string): string =>
    items.map((s) => `${indentation}"${s}",`).join('\n')

  const siblingPackageDeps = siblingModules
    .map((m) => `        .package(name: "${m}", path: "../${m}"),`)
    .join('\n')
  const siblingProductDeps = (indentation: string): string =>
    siblingModules
      .map((m) => `${indentation}.product(name: "${m}", package: "${m}"),`)
      .join('\n')

  const packageSwift = `// swift-tools-version: 6.0
${createFileMetadataString('Package.swift')}
//
// React Native SwiftPM manifest for ${moduleName}. Consumed by RN's
// SwiftPM autolinking as a "self-managed" package through the
// <app>/ios/build/generated/autolinking/libs/${moduleName}/ symlink — the
// relative package paths below resolve against that symlink location:
//   ../../../../xcframeworks -> <app>/ios/build/xcframeworks (ReactNative)
//   ../NitroModules          -> libs/NitroModules (nitro core)
//
// NOTE: these path references assume React Native SwiftPM's default
// local-artifacts mode (xcframeworks downloaded into <app>/ios/build/).
// RN's experimental remote-package mode (RN_SPM_REMOTE_URL) is not yet
// supported by generated Nitro manifests.
//

import PackageDescription

let reactCxxDefines: [CXXSetting] = [
    // Match the prebuilt React.framework's config-gated C++ ABI.
    .define("DEBUG", .when(configuration: .debug)),
    .define("NDEBUG", .when(configuration: .release)),
    // React Native's prebuilt SwiftPM distribution is New Architecture only.
    .define("RCT_NEW_ARCH_ENABLED", to: "1"),
]

let headerDirs: [CXXSetting] = [
${hasUserCpp ? '    .headerSearchPath("cpp"),\n' : ''}    .headerSearchPath("${generatedDir}/shared/c++"),
    .headerSearchPath("${generatedDir}/shared/c++/views"),
    .headerSearchPath("${generatedDir}/ios"),
    .headerSearchPath("${generatedDir}/ios/c++"),
    .headerSearchPath("${generatedDir}/ios/c++/views"),
]

let package = Package(
    name: "${spmPackageName}",
    platforms: [.iOS(.v15), .visionOS(.v1)],
    products: [${
      hasSwiftPart
        ? `
        // Only the root of the target chain is vended - SwiftPM pulls
        // ${moduleName} (Swift) and ${moduleName}Core (C++) in as its target
        // dependencies, propagating their module, public headers and objects
        // to dependents. Naming them here would add nothing.`
        : ''
    }
        .library(name: "${spmPackageName}", targets: ["${moduleName}${
          hasSwiftPart ? 'SwiftBridge' : 'Core'
        }"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "NitroModules", path: "../NitroModules"),
${siblingPackageDeps}
    ],
    targets: [
        // C++ layer: nitrogen's cross-platform specs + the user's C++ hybrids.${
          hasSwiftPart
            ? `
        // No Swift dependency — this is what the Swift target imports.`
            : `
        // This module has no Swift HybridObjects, so the ObjC++ registration
        // compiles here too (SwiftPM only forbids mixing SWIFT with C-family
        // sources) and no Swift/SwiftBridge targets are needed.`
        }
        .target(
            name: "${moduleName}Core",
            dependencies: [
                .product(name: "NitroModules", package: "NitroModules"),
${siblingProductDeps('                ')}
                .product(name: "ReactHeaders", package: "ReactNative"),
                .product(name: "ReactNativeHeaders", package: "ReactNative"),
                .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
            ],
            path: ".",
            sources: [${
              hasSwiftPart
                ? `
                "${generatedDir}/shared/c++",`
                : `
${quoteList(userClangSources, '                ')}
                "${generatedDir}/shared/c++",${
                  hasGeneratedIosCpp
                    ? `
                "${generatedDir}/ios/c++",`
                    : ''
                }
                "${generatedDir}/ios/${moduleName}Autolinking.mm",`
            }
            ],
            publicHeadersPath: "${generatedDir}/include",
            cxxSettings: headerDirs + reactCxxDefines${
              hasSwiftPart
                ? ''
                : `,
            linkerSettings: [
                .linkedFramework("Foundation"),
                .linkedFramework("UIKit", .when(platforms: [.iOS])),
            ]`
            }
        ),${
          !hasSwiftPart
            ? ''
            : `
        // Swift layer: nitrogen's Swift specs/_cxx bridges + user Swift hybrids.
        .target(
            name: "${moduleName}",
            dependencies: [
                "${moduleName}Core",
                .product(name: "NitroModules", package: "NitroModules"),
${siblingProductDeps('                ')}
            ],
            path: ".",
            sources: [
${quoteList(userSwiftSources, '                ')}
                "${generatedDir}/ios/swift",
                "${generatedDir}/ios/${moduleName}Autolinking.swift",
            ],
            swiftSettings: [
                .interoperabilityMode(.Cxx),
                .swiftLanguageMode(.v5),
            ]
        ),
        // SwiftBridge layer: every C++/ObjC++ TU that consumes the Swift-generated
        // interface header (${moduleName}-Swift.h). Structurally required:
        // these TUs cannot live in ${moduleName}Core (Core -> Swift -> Core
        // cycle) nor in the Swift target (SwiftPM forbids mixed languages).
        .target(
            name: "${moduleName}SwiftBridge",
            dependencies: [
                "${moduleName}",
                "${moduleName}Core",
                .product(name: "NitroModules", package: "NitroModules"),
${siblingProductDeps('                ')}
                .product(name: "ReactHeaders", package: "ReactNative"),
                .product(name: "ReactNativeHeaders", package: "ReactNative"),
                .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
            ],
            path: ".",
            sources: [
${quoteList(userClangSources, '                ')}
                "${generatedDir}/ios/c++",
                "${generatedDir}/ios/${moduleName}-Swift-Cxx-Bridge.cpp",
                "${generatedDir}/ios/${moduleName}Autolinking.mm",
            ],
            publicHeadersPath: "${generatedDir}/include-bridge",
            cxxSettings: headerDirs + reactCxxDefines + [
                // Under Xcode, React Native's SPM sync symlinks
                // $OBJROOT/GeneratedModuleMaps-<platform> (where Xcode stages
                // the Swift-generated ${moduleName}-Swift.h) to this stable
                // path, so the Swift-Cxx umbrella can include it TEXTUALLY.
                // Under \`swift build\` SwiftPM vends the header natively and
                // this path simply doesn't exist.
                .headerSearchPath(".spm-derived-headers"),
            ],
            linkerSettings: [
                .linkedFramework("Foundation"),
                .linkedFramework("UIKit", .when(platforms: [.iOS])),
            ]
        ),`
        }
    ],
    cxxLanguageStandard: .cxx20
)
`

  const files: AutolinkingFile[] = [
    {
      content: packageSwift,
      name: 'Package.swift',
      subdirectory: packageRootSubdirectory,
      platform: 'ios',
      language: 'swift',
    },
  ]
  if (hasSwiftPart) {
    files.push({
      content: `${createFileMetadataString(`${moduleName}Exports.swift`)}

// Re-exports this module's C++ half (the ${moduleName}Core clang target) so
// that every OTHER Swift file in this module sees nitrogen's generated C++
// specs WITHOUT importing it itself — \`@_exported import\` is visible module-
// wide, not just in this file.
//
// Under CocoaPods the module is a single mixed target, so no ${moduleName}Core
// module exists and this file compiles to nothing.
#if canImport(${moduleName}Core)
@_exported import ${moduleName}Core
#endif
`,
      name: `${moduleName}Exports.swift`,
      subdirectory: ['swift'],
      platform: 'ios',
      language: 'swift',
    })
  }
  // The `publicHeadersPath` directories referenced above
  // (<outputDir>/include/<Mod>/ and include-bridge/) do not exist in
  // the source tree at all: Nitro's RN SwiftPM autolinking plugin creates
  // them — and stages the public headers into include/<Mod>/ as a flat tree
  // of symlinks — when the app runs `react-native spm add`/`update`. That is
  // the SwiftPM analogue of CocoaPods staging `Pods/Headers/Public/<Mod>/`
  // at `pod install` time, and it always precedes a build (SwiftPM validates
  // the directories at build time, not manifest-parse time).
  return files
}
