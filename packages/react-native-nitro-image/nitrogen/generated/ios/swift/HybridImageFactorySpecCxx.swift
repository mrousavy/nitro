///
/// HybridImageFactorySpecCxx.swift
/// Sun Aug 04 2024
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/react-native-nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

import Foundation
import NitroModules

/**
 * A class implementation that bridges HybridImageFactorySpec over to C++.
 * In C++, we cannot use Swift protocols - so we need to wrap it in a class to make it strongly defined.
 *
 * Also, some Swift types need to be bridged with special handling:
 * - Enums need to be wrapped in Structs, otherwise they cannot be accessed bi-directionally (Swift bug: https://github.com/swiftlang/swift/issues/75330)
 * - Other HostObjects need to be wrapped/unwrapped from the Swift TCxx wrapper
 * - Throwing methods need to be wrapped with a Result<T, Error> type, as exceptions cannot be propagated to C++
 */
public final class HybridImageFactorySpecCxx {
  private(set) var implementation: HybridImageFactorySpec

  public init(_ implementation: HybridImageFactorySpec) {
    self.implementation = implementation
  }

  // HybridObject C++ part
  public var hybridContext: margelo.nitro.HybridContext {
    get {
      return self.implementation.hybridContext
    }
    set {
      self.implementation.hybridContext = newValue
    }
  }

  // Memory size of the Swift class (plus size of any other allocations)
  public var memorySize: Int {
    return self.implementation.memorySize
  }

  // Properties
  

  // Methods
  @inline(__always)
  public func loadImageFromFile(path: String) -> HybridImageFactorySpecCxx_loadImageFromFile_Result {
    do {
      let result = try self.implementation.loadImageFromFile(path: path)
      return .value(result.createCxxBridge())
    } catch RuntimeError.error(withMessage: let message) {
      // A  `RuntimeError` was thrown.
      return .error(message: message)
    } catch {
      // Any other kind of error was thrown.
      // Due to a Swift bug, we have to copy the string here.
      let message = "\(error.localizedDescription)"
      return .error(message: message)
    }
  }
  
  @inline(__always)
  public func loadImageFromURL(path: String) -> HybridImageFactorySpecCxx_loadImageFromURL_Result {
    do {
      let result = try self.implementation.loadImageFromURL(path: path)
      return .value(result.createCxxBridge())
    } catch RuntimeError.error(withMessage: let message) {
      // A  `RuntimeError` was thrown.
      return .error(message: message)
    } catch {
      // Any other kind of error was thrown.
      // Due to a Swift bug, we have to copy the string here.
      let message = "\(error.localizedDescription)"
      return .error(message: message)
    }
  }
  
  @inline(__always)
  public func loadImageFromSystemName(path: String) -> HybridImageFactorySpecCxx_loadImageFromSystemName_Result {
    do {
      let result = try self.implementation.loadImageFromSystemName(path: path)
      return .value(result.createCxxBridge())
    } catch RuntimeError.error(withMessage: let message) {
      // A  `RuntimeError` was thrown.
      return .error(message: message)
    } catch {
      // Any other kind of error was thrown.
      // Due to a Swift bug, we have to copy the string here.
      let message = "\(error.localizedDescription)"
      return .error(message: message)
    }
  }
  
  @inline(__always)
  public func bounceBack(image: HybridImageSpecCxx) -> HybridImageFactorySpecCxx_bounceBack_Result {
    do {
      let result = try self.implementation.bounceBack(image: image.implementation)
      return .value(result.createCxxBridge())
    } catch RuntimeError.error(withMessage: let message) {
      // A  `RuntimeError` was thrown.
      return .error(message: message)
    } catch {
      // Any other kind of error was thrown.
      // Due to a Swift bug, we have to copy the string here.
      let message = "\(error.localizedDescription)"
      return .error(message: message)
    }
  }
}
