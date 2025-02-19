///
/// HybridTestViewSpec.swift
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

import Foundation
import NitroModules

/// See ``HybridTestViewSpec``
public protocol HybridTestViewSpec_protocol: HybridObject, HybridView {
  // Properties
  var isBlue: Bool { get set }
  var someCallback: CallbackWrapper { get set }

  // Methods
  
}

/// See ``HybridTestViewSpec``
public class HybridTestViewSpec_base {
  private weak var cxxWrapper: HybridTestViewSpec_cxx? = nil
  public func getCxxWrapper() -> HybridTestViewSpec_cxx {
  #if DEBUG
    guard self is HybridTestViewSpec else {
      fatalError("`self` is not a `HybridTestViewSpec`! Did you accidentally inherit from `HybridTestViewSpec_base` instead of `HybridTestViewSpec`?")
    }
  #endif
    if let cxxWrapper = self.cxxWrapper {
      return cxxWrapper
    } else {
      let cxxWrapper = HybridTestViewSpec_cxx(self as! HybridTestViewSpec)
      self.cxxWrapper = cxxWrapper
      return cxxWrapper
    }
  }
}

/**
 * A Swift base-protocol representing the TestView HybridObject.
 * Implement this protocol to create Swift-based instances of TestView.
 * ```swift
 * class HybridTestView : HybridTestViewSpec {
 *   // ...
 * }
 * ```
 */
public typealias HybridTestViewSpec = HybridTestViewSpec_protocol & HybridTestViewSpec_base
