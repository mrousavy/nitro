//
//  SwiftPMExports.swift
//  NitroModules
//
//  SwiftPM-only: re-export the C++ core (the NitroModulesCore clang target)
//  so that `import NitroModules` exposes Nitro's C++ types
//  (margelo.nitro.ArrayBufferHolder, margelo.nitro.TestPromiseHolder, ...)
//  exactly like the single mixed-language CocoaPods module does.
//  Under CocoaPods this file compiles to nothing (no such module).
//

#if canImport(NitroModulesCore)
  @_exported import NitroModulesCore
#endif
