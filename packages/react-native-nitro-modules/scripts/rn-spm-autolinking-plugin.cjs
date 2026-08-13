/**
 * React Native SwiftPM (Preview) autolinking plugin for Nitro Modules.
 *
 * Declared in react-native.config.js (`spm.autolinkingPlugin`) — React
 * Native's SwiftPM autolinking discovers it transitively and invokes it on
 * every regeneration: the terminal `spm add` / `update`, and the in-build
 * syncs (scheme pre-action + app-target build phase).
 *
 * Do NOT rely on the in-build syncs for anything a SwiftPM target needs at
 * compile time: `xcodebuild` does not execute scheme pre-actions, and the
 * build phase belongs to the APP target, which builds AFTER the package
 * targets. Only the terminal run is guaranteed to precede a compile.
 *
 * It does four things:
 *
 * 1. CONTRIBUTES NitroModules ITSELF. React Native skips normal autolinking
 *    for a dependency that hosts a plugin (it assumes an Expo-style pure-JS
 *    host), so the plugin re-adds this package the same way the self-managed
 *    path would have: a `libs/NitroModules` symlink (stable SwiftPM identity,
 *    matching the `.package(path: "../NitroModules")` references in every
 *    nitrogen-generated module manifest) plus package/product contributions
 *    for the app's aggregator.
 *
 * 2. WARNS ABOUT NITRO MODULES THAT HAVE NOT OPTED INTO SwiftPM
 *    (no `spm.name` in their react-native.config.js). Note this only reaches
 *    the user for single-language (C++-only) modules — see
 *    findNitroModulesWithoutSwiftPM for why.
 *
 * 3. STAGES EVERY NITRO PACKAGE'S PUBLIC HEADERS (see stagePublicHeaders) —
 *    the flat symlink tree behind each manifest's `publicHeadersPath`, and
 *    the (empty) `include-bridge/` dir for the SwiftBridge targets. The
 *    SwiftPM analogue of CocoaPods staging `Pods/Headers/Public/<Mod>/` at
 *    `pod install` time: the source tree ships no placeholder or alias files
 *    at all.
 *
 * 4. VENDS XCODE'S GENERATED INTEROP HEADERS. Xcode stages every SwiftPM
 *    Swift target's generated C++ interop header (`<Module>-Swift.h`) under
 *    `$OBJROOT/GeneratedModuleMaps-<platform>/` in DerivedData, and only
 *    vends it to dependent targets as a clang module — which a C++-interop
 *    header cannot be consumed as (its C++ declarations must be in scope
 *    BEFORE the header is parsed). Nitro's Swift-Cxx umbrella includes it
 *    TEXTUALLY instead. Since a static Package.swift cannot know the
 *    DerivedData path, the plugin symlinks it to a stable location inside
 *    every self-managed package:
 *
 *      <package>/.spm-derived-headers -> $OBJROOT
 *
 *    The nitrogen-generated manifests add
 *    `.headerSearchPath(".spm-derived-headers")`, and the umbrella picks the
 *    platform subdirectory (`GeneratedModuleMaps-iphonesimulator/…`) via
 *    TargetConditionals — the link is platform-independent and survives
 *    simulator/device switches without a re-sync.
 *
 *    Because the link must exist BEFORE any SwiftPM target compiles, and the
 *    in-build syncs cannot guarantee that (see above), OBJROOT is resolved
 *    from the environment when Xcode provides it and otherwise queried via
 *    `xcodebuild -showBuildSettings` during the terminal run.
 *
 *    Under plain `swift build` (no Xcode) the header is vended natively by
 *    SwiftPM and nothing else is needed.
 *
 * The plugin writes only into Nitro's own package directories and the
 * autolinker's `libs/` alias dir — never React Native's generated manifests.
 *
 * RN treats a throwing plugin as fatal, so this one throws for exactly one
 * class of problem: a misconfiguration the developer must fix (see
 * NitroConfigurationError). Every other failure degrades to a warning — a
 * plugin hiccup must not break an otherwise working build.
 */
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const NITRO_PACKAGE_ROOT = path.resolve(__dirname, '..')
const SWIFT_NAME = 'NitroModules'

/**
 * A misconfiguration the developer must fix (as opposed to an environment
 * failure the plugin can degrade around). Thrown out of the plugin so React
 * Native stops with the message intact.
 */
class NitroConfigurationError extends Error {}

/**
 * Create/refresh `linkPath -> target`. Returns null on success, or a message
 * describing the failure — callers surface it. A silent failure here shows up
 * thousands of lines later as an unintelligible C++ error about incomplete
 * types, so a read-only store (pnpm) must degrade LOUDLY, not invisibly.
 */
function ensureSymlink(linkPath, target) {
  try {
    // lstat, NOT existsSync: existsSync follows the link and reports `false`
    // for a DANGLING one (a stale DerivedData that has since been cleaned),
    // which would leave the stale link in place.
    let current = null
    try {
      if (fs.lstatSync(linkPath).isSymbolicLink()) {
        current = fs.readlinkSync(linkPath)
      }
    } catch {
      // Nothing there yet.
    }
    if (current === target) return null
    fs.rmSync(linkPath, { recursive: false, force: true })
    fs.symlinkSync(target, linkPath)
    return null
  } catch (e) {
    return `${linkPath}: ${e.code ?? String(e)}`
  }
}

/**
 * Where Xcode stages each Swift target's generated C++ interop header
 * (`<Module>-Swift.h`), i.e. `$OBJROOT/GeneratedModuleMaps-<platform>/`.
 *
 * OBJROOT is only exported in some of the contexts this plugin runs in — the
 * scheme pre-action and the terminal `spm add`/`update` may not have it — so
 * fall back to deriving it from the other build settings Xcode does export.
 * Returns null when there is no Xcode environment at all (plain `swift build`,
 * where SwiftPM vends the header natively and no link is needed).
 */
function resolveObjRoot() {
  const direct = process.env.OBJROOT
  if (direct != null && direct.length > 0) return direct
  // OBJROOT is conventionally a sibling of SYMROOT inside DerivedData/Build:
  //   <DD>/Build/Products (SYMROOT) -> <DD>/Build/Intermediates.noindex
  const symRoot = process.env.SYMROOT ?? process.env.BUILD_DIR
  if (symRoot != null && symRoot.length > 0) {
    const buildDir = path.dirname(symRoot.replace(/\/+$/, ''))
    const derived = path.join(buildDir, 'Intermediates.noindex')
    if (fs.existsSync(derived)) return derived
  }
  // PROJECT_TEMP_DIR = $OBJROOT/<Project>.build — walk up one level.
  const projectTemp = process.env.PROJECT_TEMP_DIR
  if (projectTemp != null && projectTemp.length > 0) {
    const up = path.dirname(projectTemp.replace(/\/+$/, ''))
    if (fs.existsSync(up)) return up
  }
  return null
}

/**
 * Ask Xcode where it stages intermediates for this project.
 *
 * Needed because the link must exist BEFORE any SwiftPM target compiles, and
 * none of the in-build hooks can guarantee that: RN's sync runs as a scheme
 * pre-action (which `xcodebuild` does not execute) and as a build phase of the
 * APP target — which builds *after* the package targets that consume the
 * header. So the link has to be created from the terminal, during
 * `react-native spm add` / `update`, where no build settings are exported.
 *
 * OBJROOT is stable per project (it does not vary with configuration or
 * destination), so one query is enough. Best-effort and slow (~seconds), hence
 * only used as the last resort, and only when a project can be found.
 */
function queryObjRootFromXcode(context) {
  const appRoot = context?.appRoot ?? context?.projectRoot
  if (typeof appRoot !== 'string' || appRoot.length === 0) return null
  let projectDir = appRoot
  let project = findXcodeproj(projectDir)
  if (project == null) {
    projectDir = path.join(appRoot, 'ios')
    project = findXcodeproj(projectDir)
  }
  if (project == null) return null
  const projectPath = path.join(projectDir, project)
  const run = (args) =>
    execFileSync('xcodebuild', args, {
      encoding: 'utf8',
      timeout: 180000,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  try {
    // A SCHEME is required: without one, xcodebuild reports the legacy
    // project-local `<project>/build` for OBJROOT instead of the DerivedData
    // path an actual `-scheme` build uses — linking to it would silently point
    // the umbrella at a directory Xcode never writes the interop header into.
    const listed = JSON.parse(run(['-project', projectPath, '-list', '-json']))
    const schemes = listed?.project?.schemes
    if (!Array.isArray(schemes) || schemes.length === 0) return null
    // Prefer the APP scheme (named after the .xcodeproj). The list also
    // contains one scheme per SwiftPM package (`Autolinked`, `NitroTest`, …)
    // and those sort first alphabetically — querying one of those would report
    // a different OBJROOT than the app build actually uses.
    const appScheme = path.basename(project, '.xcodeproj')
    const scheme = schemes.includes(appScheme) ? appScheme : schemes[0]
    if (typeof scheme !== 'string' || scheme.length === 0) return null
    const out = run([
      '-project',
      projectPath,
      '-scheme',
      scheme,
      '-showBuildSettings',
    ])
    const match = out.match(/^\s*OBJROOT = (.+)$/m)
    const value = match?.[1]?.trim()
    return value != null && value.length > 0 ? value : null
  } catch {
    // No Xcode, unresolvable project/scheme, or the query timed out — the
    // caller reports the resulting failure.
    return null
  }
}

function findXcodeproj(dir) {
  try {
    return (
      fs.readdirSync(dir).find((entry) => entry.endsWith('.xcodeproj')) ?? null
    )
  } catch {
    return null
  }
}

/**
 * Real directories of every package that may contain a nitrogen-generated
 * manifest: Nitro core itself plus every autolinked dependency. Resolved to
 * real paths so the link lands next to the package's own `Package.swift`
 * regardless of how many symlinks (workspace links, `libs/` aliases) point at
 * it — and so two aliases for one package can't create two competing links.
 *
 * Linking a non-Nitro dependency is harmless: `.spm-derived-headers` is only
 * ever read by a manifest that declares it as a header search path.
 */
function collectPackageRoots(context) {
  const roots = new Set()
  const add = (dir) => {
    if (typeof dir !== 'string' || dir.length === 0) return
    try {
      roots.add(fs.realpathSync(dir))
    } catch {
      // Dependency root does not exist — nothing to link.
    }
  }
  add(NITRO_PACKAGE_ROOT)
  const deps = context?.autolinking?.dependencies
  if (deps != null && typeof deps === 'object') {
    for (const dep of Object.values(deps)) {
      add(dep?.root)
    }
  }
  return roots
}

/**
 * Stages a Nitro package's public headers into its SwiftPM
 * `publicHeadersPath` directory as a FLAT tree of symlinks:
 *
 *   core:    <root>/include/NitroModules/<Header>.hpp -> ../../cpp/…
 *   modules: <root>/nitrogen/generated/include/<Mod>/<Header>.hpp -> …
 *
 * This is the SwiftPM analogue of what CocoaPods does at `pod install` time
 * (staging `Pods/Headers/Public/<Mod>/` + headermaps): it is what makes the
 * public `#include <Mod/Header.hpp>` spelling — and the bare-name includes
 * between Nitro headers — resolve for consumers, because SwiftPM propagates
 * ONLY the one `publicHeadersPath` directory and has no staging step of its
 * own. The headers themselves stay exactly where they live in the source
 * tree; only symlinks are created, at `spm add`/`update` time, so nothing is
 * committed (beyond a `.gitkeep`) and nothing ships in the npm tarball —
 * npm drops symlinks when packing, which is why the tree cannot simply be
 * checked in.
 *
 * Returns a list of failure messages (empty on success).
 */
function stagePublicHeaders(root) {
  // Every return below MUST have this shape — the caller spreads both fields.
  const nothing = { warnings: [], conflicts: [] }
  const isCore = root === fs.realpathSync(NITRO_PACKAGE_ROOT)
  // Module packages: only stage packages that carry a nitrogen-generated
  // SwiftPM manifest — other autolinked deps (e.g. react-native-screens) have
  // no Nitro header tree to stage.
  if (!isCore && !fs.existsSync(path.join(root, 'nitrogen', 'generated'))) {
    return nothing
  }
  const manifest = path.join(root, 'Package.swift')
  if (!fs.existsSync(manifest)) return nothing

  // The staging dir name must equal the SWIFT MODULE name consumers write in
  // `#include <Mod/Header.hpp>` (nitro.json's `ios.iosModuleName`) — NOT the
  // SwiftPM package name in Package.swift, which React Native derives from the
  // npm package name and is usually different (e.g. package
  // `ReactNativeNitroTest` contains module `NitroTest`).
  let moduleName = SWIFT_NAME
  if (!isCore) {
    try {
      const nitroJson = JSON.parse(
        fs.readFileSync(path.join(root, 'nitro.json'), 'utf8')
      )
      const name = nitroJson?.ios?.iosModuleName
      if (typeof name !== 'string' || name.length === 0) return nothing
      moduleName = name
    } catch {
      // Not a Nitro module (or unreadable config) — nothing to stage.
      return nothing
    }
  }

  // Collect the package's public headers (they stay in place).
  const headers = []
  const collect = (rel, exts = ['.hpp', '.h']) => {
    const abs = path.join(root, rel)
    if (!fs.existsSync(abs)) return
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      const relPath = path.join(rel, entry.name)
      if (entry.isDirectory()) collect(relPath, exts)
      else if (exts.some((e) => entry.name.endsWith(e))) headers.push(relPath)
    }
  }
  if (isCore) {
    // .hpp only: the C++ module's public surface. ObjC headers (e.g. the
    // TurboModule's NativeNitroModules.h) are not part of it.
    collect('cpp', ['.hpp'])
    collect('ios', ['.hpp'])
  } else {
    collect('cpp')
    collect(path.join('nitrogen', 'generated', 'shared', 'c++'))
    const bridge = path.join(
      'nitrogen',
      'generated',
      'ios',
      `${moduleName}-Swift-Cxx-Bridge.hpp`
    )
    if (fs.existsSync(path.join(root, bridge))) headers.push(bridge)
  }

  const stagingDir = isCore
    ? path.join(root, 'include', SWIFT_NAME)
    : path.join(root, 'nitrogen', 'generated', 'include', moduleName)

  const warnings = []
  const conflicts = []
  try {
    fs.mkdirSync(stagingDir, { recursive: true })
    // The <Mod>SwiftBridge target's publicHeadersPath — it exposes no public
    // headers, but SwiftPM requires the directory to exist at build time.
    // Created empty here for the same reason the staging dir is: placeholders
    // don't belong in the source tree or the npm tarball. Only modules with a
    // Swift part HAVE a SwiftBridge target — a C++-only module is a single
    // target and must not get a stray unused directory.
    if (!isCore && hasSwiftPart(root)) {
      fs.mkdirSync(path.join(root, 'nitrogen', 'generated', 'include-bridge'), {
        recursive: true,
      })
    }
  } catch (e) {
    return { warnings: [`${stagingDir}: ${e.code ?? String(e)}`], conflicts }
  }

  const wanted = new Map()
  for (const header of headers) {
    const name = path.basename(header)
    const previous = wanted.get(name)
    if (previous != null) {
      // A CONFIGURATION error, not an environment hiccup: the two headers can
      // never both be reachable as <Mod/name>. Reported as fatal so it stops
      // here, instead of surfacing later as a bewildering "file not found" on
      // whichever header lost the race.
      conflicts.push(
        `  ${moduleName}: duplicate header name "${name}"\n` +
          `    ${previous}\n    ${header}`
      )
      continue
    }
    wanted.set(name, header)
    const failure = ensureSymlink(
      path.join(stagingDir, name),
      path.relative(stagingDir, path.join(root, header))
    )
    if (failure != null) warnings.push(failure)
  }

  // Drop stale aliases for headers that no longer exist (keep `.gitkeep`).
  try {
    for (const entry of fs.readdirSync(stagingDir)) {
      if (entry === '.gitkeep' || wanted.has(entry)) continue
      fs.rmSync(path.join(stagingDir, entry), { force: true })
    }
  } catch {
    // Purely cosmetic cleanup — never fail staging over it.
  }
  return { warnings, conflicts }
}

/**
 * Whether this module has Swift HybridObjects — i.e. nitrogen emitted Swift
 * sources for it, which is exactly when its manifest declares the Swift and
 * `<Mod>SwiftBridge` targets. A C++-only module is a single target.
 */
function hasSwiftPart(root) {
  return fs.existsSync(path.join(root, 'nitrogen', 'generated', 'ios', 'swift'))
}

/**
 * Nitro modules that have no `Package.swift`, i.e. that have not opted into
 * SwiftPM support, i.e. that declare no `spm.name` in react-native.config.js.
 *
 * Without a manifest React Native falls back to auto-scaffolding one from the
 * podspec, which says nothing about Nitro or about the one-line fix.
 *
 * IMPORTANT — this only reaches the user for modules RN can still scaffold,
 * i.e. SINGLE-LANGUAGE ones (a C++-only Nitro module). React Native generates
 * autolinked targets long BEFORE it invokes plugins, so for a Swift-backed
 * module it has already failed with
 *
 *   error: "<dep>" has mixed Swift + Objective-C/C++ sources, which Swift
 *   Package Manager cannot compile in a single target …
 *
 * by the time this runs. That error is the one most users will actually see;
 * making it mention Nitro requires a change in React Native, not here.
 */
function findNitroModulesWithoutSwiftPM(context) {
  const found = []
  const deps = context?.autolinking?.dependencies
  if (deps == null || typeof deps !== 'object') return found
  let corePath = null
  try {
    corePath = fs.realpathSync(NITRO_PACKAGE_ROOT)
  } catch {
    // Ignore — only used to skip Nitro core itself.
  }
  for (const [name, dep] of Object.entries(deps)) {
    const root = dep?.root
    if (typeof root !== 'string' || root.length === 0) continue
    try {
      const real = fs.realpathSync(root)
      if (real === corePath) continue
      const isNitroModule =
        fs.existsSync(path.join(real, 'nitro.json')) ||
        fs.existsSync(path.join(real, 'nitrogen', 'generated'))
      if (!isNitroModule) continue
      if (fs.existsSync(path.join(real, 'Package.swift'))) continue
      found.push(name)
    } catch {
      // Unreadable dependency root — nothing to report.
    }
  }
  return found
}

module.exports = function nitroSpmAutolinkingPlugin(context) {
  const contribution = {
    packageDependencies: [],
    productDependencies: [],
    watchPaths: [path.join(NITRO_PACKAGE_ROOT, 'Package.swift')],
  }
  try {
    const libsDir = path.join(context.outputDir, 'libs')
    fs.mkdirSync(libsDir, { recursive: true })

    // 1. Re-add NitroModules itself (RN skipped it as the plugin host).
    //    Routing through libs/NitroModules keeps ONE SwiftPM identity with the
    //    `.package(name: "NitroModules", path: "../NitroModules")` references
    //    in every nitro module's generated Package.swift.
    ensureSymlink(path.join(libsDir, SWIFT_NAME), NITRO_PACKAGE_ROOT)
    contribution.packageDependencies.push({
      name: SWIFT_NAME,
      path: `libs/${SWIFT_NAME}`,
    })
    contribution.productDependencies.push({
      name: SWIFT_NAME,
      package: SWIFT_NAME,
    })

    // 2. Point at the real cause. Only reachable for single-language
    //    modules — RN aborts on mixed-language ones before invoking plugins.
    const notOptedIn = findNitroModulesWithoutSwiftPM(context)
    if (notOptedIn.length > 0) {
      const list = notOptedIn.map((n) => `    - ${n}`).join('\n')
      console.warn(
        `[NitroModules] These Nitro modules have no Package.swift, so React ` +
          `Native will try to scaffold one and fail with "has mixed Swift + ` +
          `Objective-C/C++ sources":\n${list}\n` +
          `  To fix, in each module's react-native.config.js set:\n` +
          `    spm: { name: '<its iOS module name>' }\n` +
          `  then re-run nitrogen in that module (the config is a codegen ` +
          `input — \`react-native spm\` does not re-run it).`
      )
    }

    // 3. Stage every Nitro package's public headers into its SwiftPM
    //    `publicHeadersPath` dir (see stagePublicHeaders). Two failure
    //    classes: a CONFIGURATION conflict is fatal here (it can only ever
    //    produce a bewildering "file not found" later), while an environment
    //    hiccup (read-only store) is loud but non-fatal.
    {
      const warnings = []
      const conflicts = []
      for (const root of collectPackageRoots(context)) {
        const result = stagePublicHeaders(root)
        warnings.push(...result.warnings)
        conflicts.push(...result.conflicts)
      }
      if (conflicts.length > 0) {
        throw new NitroConfigurationError(
          `Nitro modules expose all of their public headers from a single ` +
            `include directory, so header file names must be unique within a ` +
            `module. Rename one of each pair below and re-run nitrogen:\n` +
            conflicts.join('\n')
        )
      }
      if (warnings.length > 0) {
        console.warn(
          `[NitroModules] Could not stage public headers for SwiftPM — ` +
            `dependent modules will fail to compile with "<Module>/….hpp ` +
            `file not found". Failures:\n  ` +
            warnings.join('\n  ')
        )
      }
    }

    // 4. Vend Xcode's generated interop headers.
    //
    //    The link must exist BEFORE any SwiftPM target compiles. Package roots
    //    are derived from the autolinking dep list rather than by listing
    //    `libs/`, because RN populates `libs/` for self-managed packages AFTER
    //    invoking plugins — listing it here sees only the previous run's
    //    entries, so a clean build would link nothing and the SwiftBridge targets
    //    would fail on a missing `<Module>-Swift.h`.
    const objRoot = resolveObjRoot() ?? queryObjRootFromXcode(context)
    if (objRoot != null) {
      const failures = []
      for (const root of collectPackageRoots(context)) {
        const failure = ensureSymlink(
          path.join(root, '.spm-derived-headers'),
          objRoot
        )
        if (failure != null) failures.push(failure)
      }
      if (failures.length > 0) {
        console.warn(
          `[NitroModules] Could not stage Xcode's generated Swift interop ` +
            `headers — Swift-backed HybridObjects will fail to compile with ` +
            `"autogenerated Swift header cannot be found". Failures:\n  ` +
            failures.join('\n  ')
        )
      }
    }
  } catch (e) {
    // A misconfiguration the developer must fix propagates: React Native
    // wraps it ("the autolinking plugin for 'X' threw: …") and stops, which
    // is far better than letting the build fail later for an unrelated-looking
    // reason. Everything else stays non-fatal — a plugin hiccup must not be
    // the thing that breaks an otherwise working build.
    if (e instanceof NitroConfigurationError) throw e
    console.warn(
      `[NitroModules] SwiftPM autolinking plugin failed (build may miss Nitro): ${String(e)}`
    )
  }
  return contribution
}
