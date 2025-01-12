//
//  HybridObject.swift
//  NitroModules
//
//  Created by Marc Rousavy on 23.07.24.
//

import Foundation

@available(*, deprecated, message: "HybridObjectSpec (a protocol) has been replaced with HybridObject (a class).")
public protocol HybridObjectSpec: AnyObject {
  var memorySize: Int { get }
}

/**
 * The base class for all Swift-based HybridObjects.
 */
open class HybridObject: HybridObjectSpec {
  /**
   * Get the memory size of any external heap allocations in bytes.
   *
   * Override this to allow tracking heap allocations such as buffers or images,
   * which will help the JS GC be more efficient in deleting large unused objects.
   *
   * @default 0
   * @example
   * ```swift
   * override public var memorySize: Int {
   *   let imageSize = self.uiImage.bytesPerRow * self.uiImage.height
   *   return imageSize
   * }
   * ```
   */
  open var memorySize: Int { return 0 }
}

public extension HybridObjectSpec {
  @available(*, deprecated, message: "getSizeOf(...) will now be default-computed. Please remove getSizeOf() from your code.")
  func getSizeOf<T: AnyObject>(_ instance: T) -> Int {
    return 0
  }
}
