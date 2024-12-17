///
/// HybridBaseSpec.swift
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

import Foundation
import NitroModules

/// See ``HybridBaseSpec``
public protocol HybridBaseSpec_protocol: AnyObject {
  // Properties
  var baseValue: Double { get }

  // Methods
  
}

/// See ``HybridBaseSpec``
public class HybridBaseSpec_base: HybridObjectSpec {
  public func getCxxWrapper() -> HybridBaseSpec_cxx {
  #if DEBUG
    guard self is HybridBaseSpec else {
      fatalError("`self` is not a `HybridBaseSpec`! Did you accidentally inherit from `HybridBaseSpec_base` instead of `HybridBaseSpec`?")
    }
  #endif
    return HybridBaseSpec_cxx(self as! HybridBaseSpec)
  }
  public var hybridContext = margelo.nitro.HybridContext()
  public var memorySize: Int { return getSizeOf(self) }
}

/**
 * A Swift base-protocol representing the Base HybridObject.
 * Implement this protocol to create Swift-based instances of Base.
 * ```swift
 * class HybridBase : HybridBaseSpec {
 *   // ...
 * }
 * ```
 */
public typealias HybridBaseSpec = HybridBaseSpec_protocol & HybridBaseSpec_base
