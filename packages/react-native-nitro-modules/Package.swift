// swift-tools-version: 6.0
// NitroModules — SwiftPM manifest (React Native SwiftPM Preview support)
//
// Consumed by React Native's SwiftPM autolinking as a "self-managed"
// package: the autolinker references this directory through a symlink at
// <app>/ios/build/generated/autolinking/libs/NitroModules/, and SwiftPM
// resolves the relative `.package(path:)` references below against that
// symlink location — NOT against this file's real directory. That makes
// the paths app-layout-independent:
//   ../../../../xcframeworks -> <app>/ios/build/xcframeworks   (ReactNative)
//   ../../../ios             -> <app>/ios/build/generated/ios  (React-GeneratedCode)
//
// SwiftPM cannot compile Swift and C++ in a single target (CocoaPods can),
// so the pod's single mixed target is split:
//   - NitroModulesCore (C++/ObjC++): cpp/** + ios C-family sources.
//     Public headers live in include/NitroModules/.
//   - NitroModules (Swift): ios/**/*.swift with C++ interop enabled.
//     Re-exports NitroModulesCore (ios/utils/SwiftPMExports.swift) so
//     `import NitroModules` behaves like the mixed CocoaPods module.

import PackageDescription

let reactCxxDefines: [CXXSetting] = [
    // Match the prebuilt React.framework's config-gated C++ ABI: NDEBUG in
    // Release strips DebugStringConvertible's vtable / shifts ShadowNode's
    // layout, so mismatching defines fail at link time.
    .define("DEBUG", .when(configuration: .debug)),
    .define("NDEBUG", .when(configuration: .release)),
    // React Native's prebuilt SwiftPM distribution is New Architecture only.
    .define("RCT_NEW_ARCH_ENABLED", to: "1"),
]


let package = Package(
    name: "NitroModules",
    platforms: [.iOS(.v15), .visionOS(.v1)],
    products: [
        // Only the Swift half is vended: NitroModulesCore comes along as its
        // target dependency, and SwiftPM propagates a transitive clang target's
        // public headers, modulemap and objects to whoever depends on the
        // product. So dependents still get `import NitroModules` AND
        // `#include <NitroModules/AnyMap.hpp>` without naming Core anywhere.
        .library(name: "NitroModules", targets: ["NitroModules"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
    ],
    targets: [
        .target(
            name: "NitroModulesCore",
            dependencies: [
                .product(name: "ReactHeaders", package: "ReactNative"),
                .product(name: "ReactNativeHeaders", package: "ReactNative"),
                .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
                // The app's codegen output — serves <NitroModulesSpec/NitroModulesSpec.h>.
                .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
            ],
            path: ".",
            sources: [
                "cpp",
                "ios/platform",
                "ios/threading",
                "ios/turbomodule",
            ],
            publicHeadersPath: "include",
            cxxSettings: [
                // The headers live in their normal homes (cpp/**, ios/**) and
                // include each other by bare name (CocoaPods resolves that via
                // headermaps). include/NitroModules/ is the flat symlink tree
                // staged at `react-native spm add` time by the autolinking
                // plugin — one search path resolves every bare-name include.
                .headerSearchPath("include/NitroModules")
            ] + reactCxxDefines,
            linkerSettings: [
                .linkedFramework("Foundation"),
                .linkedFramework("UIKit", .when(platforms: [.iOS])),
            ]
        ),
        .target(
            name: "NitroModules",
            dependencies: ["NitroModulesCore"],
            path: "ios",
            sources: [
                "core/AnyMap.swift",
                "core/ArrayBuffer.swift",
                "core/HybridObject.swift",
                "core/Null.swift",
                "core/Promise.swift",
                "core/RuntimeError.swift",
                "utils/Date+fromChrono.swift",
                "utils/MemoryHelper.swift",
                "utils/SwiftClosure.swift",
                "utils/SwiftPMExports.swift",
                "views/HybridView.swift",
                "views/RecyclableView.swift",
            ],
            swiftSettings: [
                .interoperabilityMode(.Cxx),
                .swiftLanguageMode(.v5),
            ]
        ),
    ],
    cxxLanguageStandard: .cxx20
)
