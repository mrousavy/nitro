///
/// HybridImageFactorySpec.swift
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

import Foundation
import NitroModules

/// See ``HybridImageFactorySpec``
public protocol HybridImageFactorySpec_protocol: AnyObject {
  // Properties
  

  // Methods
  func loadImageFromFile(path: String) throws -> (any HybridImageSpec)
  func loadImageFromURL(path: String) throws -> (any HybridImageSpec)
  func loadImageFromSystemName(path: String) throws -> (any HybridImageSpec)
  func bounceBack(image: (any HybridImageSpec)) throws -> (any HybridImageSpec)
}

/// See ``HybridImageFactorySpec``
public class HybridImageFactorySpec_base: HybridObjectSpec {
  public func getCxxWrapper() -> HybridImageFactorySpec_cxx {
  #if DEBUG
    guard self is HybridImageFactorySpec else {
      fatalError("`self` is not a `HybridImageFactorySpec`! Did you accidentally inherit from `HybridImageFactorySpec_base` instead of `HybridImageFactorySpec`?")
    }
  #endif
    return HybridImageFactorySpec_cxx(self as! HybridImageFactorySpec)
  }
  public var hybridContext = margelo.nitro.HybridContext()
  public var memorySize: Int { return getSizeOf(self) }
}

/**
 * A Swift base-protocol representing the ImageFactory HybridObject.
 * Implement this protocol to create Swift-based instances of ImageFactory.
 * ```swift
 * class HybridImageFactory : HybridImageFactorySpec {
 *   // ...
 * }
 * ```
 */
public typealias HybridImageFactorySpec = HybridImageFactorySpec_protocol & HybridImageFactorySpec_base
