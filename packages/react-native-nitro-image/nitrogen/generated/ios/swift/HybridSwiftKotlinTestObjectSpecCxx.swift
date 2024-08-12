///
/// HybridSwiftKotlinTestObjectSpecCxx.swift
/// Mon Aug 12 2024
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/react-native-nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

import Foundation
import NitroModules

/**
 * A class implementation that bridges HybridSwiftKotlinTestObjectSpec over to C++.
 * In C++, we cannot use Swift protocols - so we need to wrap it in a class to make it strongly defined.
 *
 * Also, some Swift types need to be bridged with special handling:
 * - Enums need to be wrapped in Structs, otherwise they cannot be accessed bi-directionally (Swift bug: https://github.com/swiftlang/swift/issues/75330)
 * - Other HybridObjects need to be wrapped/unwrapped from the Swift TCxx wrapper
 * - Throwing methods need to be wrapped with a Result<T, Error> type, as exceptions cannot be propagated to C++
 */
public final class HybridSwiftKotlinTestObjectSpecCxx {
  private(set) var implementation: HybridSwiftKotlinTestObjectSpec

  public init(_ implementation: HybridSwiftKotlinTestObjectSpec) {
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
  public var numberValue: Double {
    @inline(__always)
    get {
      return self.implementation.numberValue
    }
    @inline(__always)
    set {
      self.implementation.numberValue = newValue
    }
  }
  
  public var boolValue: Bool {
    @inline(__always)
    get {
      return self.implementation.boolValue
    }
    @inline(__always)
    set {
      self.implementation.boolValue = newValue
    }
  }
  
  public var stringValue: String {
    @inline(__always)
    get {
      return self.implementation.stringValue
    }
    @inline(__always)
    set {
      self.implementation.stringValue = newValue
    }
  }
  
  public var bigintValue: Int64 {
    @inline(__always)
    get {
      return self.implementation.bigintValue
    }
    @inline(__always)
    set {
      self.implementation.bigintValue = newValue
    }
  }
  
  public var stringOrUndefined: String? {
    @inline(__always)
    get {
      return self.implementation.stringOrUndefined
    }
    @inline(__always)
    set {
      self.implementation.stringOrUndefined = newValue
    }
  }
  
  public var stringOrNull: String? {
    @inline(__always)
    get {
      return self.implementation.stringOrNull
    }
    @inline(__always)
    set {
      self.implementation.stringOrNull = newValue
    }
  }
  
  public var optionalString: String? {
    @inline(__always)
    get {
      return self.implementation.optionalString
    }
    @inline(__always)
    set {
      self.implementation.optionalString = newValue
    }
  }

  // Methods
  @inline(__always)
  public func simpleFunc() -> Void {
    do {
      try self.implementation.simpleFunc()
    } catch {
      // TODO: Wait for https://github.com/swiftlang/swift/issues/75290
      fatalError("Swift errors cannot be propagated to C++ yet! If you want to throw errors, consider using a Promise (async) or a variant type (sync) instead.")
    }
  }
  
  @inline(__always)
  public func addNumbers(a: Double, b: Double) -> Double {
    do {
      let result = try self.implementation.addNumbers(a: a, b: b)
      return result
    } catch {
      // TODO: Wait for https://github.com/swiftlang/swift/issues/75290
      fatalError("Swift errors cannot be propagated to C++ yet! If you want to throw errors, consider using a Promise (async) or a variant type (sync) instead.")
    }
  }
  
  @inline(__always)
  public func addStrings(a: String, b: String) -> String {
    do {
      let result = try self.implementation.addStrings(a: a, b: b)
      return result
    } catch {
      // TODO: Wait for https://github.com/swiftlang/swift/issues/75290
      fatalError("Swift errors cannot be propagated to C++ yet! If you want to throw errors, consider using a Promise (async) or a variant type (sync) instead.")
    }
  }
  
  @inline(__always)
  public func multipleArguments(num: Double, str: String, boo: Bool) -> Void {
    do {
      try self.implementation.multipleArguments(num: num, str: str, boo: boo)
    } catch {
      // TODO: Wait for https://github.com/swiftlang/swift/issues/75290
      fatalError("Swift errors cannot be propagated to C++ yet! If you want to throw errors, consider using a Promise (async) or a variant type (sync) instead.")
    }
  }
  
  @inline(__always)
  public func createNumbers() -> [Double] {
    do {
      let result = try self.implementation.createNumbers()
      return result
    } catch {
      // TODO: Wait for https://github.com/swiftlang/swift/issues/75290
      fatalError("Swift errors cannot be propagated to C++ yet! If you want to throw errors, consider using a Promise (async) or a variant type (sync) instead.")
    }
  }
  
  @inline(__always)
  public func createStrings() -> [String] {
    do {
      let result = try self.implementation.createStrings()
      return result
    } catch {
      // TODO: Wait for https://github.com/swiftlang/swift/issues/75290
      fatalError("Swift errors cannot be propagated to C++ yet! If you want to throw errors, consider using a Promise (async) or a variant type (sync) instead.")
    }
  }
}
