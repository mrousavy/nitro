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
   *   return getSizeOf(self) + imageSize
   * }
   * ```
   */
  var memorySize: Int { get }
}

public extension HybridObjectSpec {
  /**
   * Get the memory size of the given instance.
   * This only accounts for stack allocated member variables,
   * not for externally allocated heap allocations like images or buffers.
   */
  func getSizeOf<T: AnyObject>(_ instance: T) -> Int {
    return malloc_size(Unmanaged.passUnretained(instance).toOpaque())
  }
}
