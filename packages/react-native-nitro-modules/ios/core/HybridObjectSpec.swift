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
public protocol HybridObjectSpec {
  /**
   * Holds the C++ HybridObject and it's context.
   * Use the default initializer in your implementation, C++ will set and get this value.
   */
  var hybridContext: margelo.nitro.HybridContext { get set }
  /**
   * Get the memory size of the instance, in bytes.
   *
   * Override this to allow tracking heap allocations such as buffers or images,
   * which will help the JS GC be more efficient in deleting large unused objects.
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
