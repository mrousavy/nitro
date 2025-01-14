//
//  HybridObject.swift
//  NitroModules
//
//  Created by Marc Rousavy on 23.07.24.
//

import Foundation

/**
 * A base protocol for all Swift-based Hybrid Objects.
 */
public protocol HybridObject: AnyObject {
  /**
   * Get the memory size of the Swift instance (plus any external heap allocations),
   * in bytes.
   *
   * Override this to allow tracking heap allocations such as buffers or images,
   * which will help the JS GC be more efficient in deleting large unused objects.
   *
   * @example
   * ```swift
   * var memorySize: Int {
   *   let imageSize = self.uiImage.bytesPerRow * self.uiImage.height
   *   return imageSize
   * }
   * ```
   */
  var memorySize: Int { get }
}

extension HybridObject {
  // By default, this returns `0`.
  var memorySize: Int { return 0 }
}

@available(*, deprecated, message: "HybridObjectSpec has been renamed to HybridObject. Update Nitrogen and re-generate your specs.")
public typealias HybridObjectSpec = HybridObject

public extension HybridObjectSpec {
  @available(*, deprecated, message: "getSizeOf(...) will now be default-computed. Please remove getSizeOf() from your code.")
  func getSizeOf<T: AnyObject>(_ instance: T) -> Int {
    return 0
  }
}
