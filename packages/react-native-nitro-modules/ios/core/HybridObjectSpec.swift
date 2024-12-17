//
//  HybridObjectSpec.swift
//  NitroModules
//
//  Created by Marc Rousavy on 23.07.24.
//

import Foundation

/**
 * A base protocol for all Swift-based Hybrid Objects.
 */
public protocol HybridObjectSpec: AnyObject {
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

public extension HybridObjectSpec {
  @available(*, deprecated, message: "getSizeOf(...) will now be default-computed. Please remove getSizeOf() from your code.")
  func getSizeOf<T: AnyObject>(_ instance: T) -> Int {
    return 0
  }
}
