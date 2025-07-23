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

  /**
   * Eagerly- (and manually-) dispose all native resources this `HybridObject` holds.
   * This method can only be manually called from JS using `dispose()`.
   *
   * If this method is never manually called, a `HybridObject` is expected to disposes it's
   * resources as usual via the object's destructor (`~HybridObject()`, `deinit` or `finalize()`).
   *
   * By default, this method does nothing. It can be overridden to perform actual disposing/cleanup
   * if required.
   */
  func dispose()
}

public extension HybridObject {
  // By default, this returns `0`.
  var memorySize: Int { return 0 }
  // By default, this does nothing.
  func dispose() { }
}
