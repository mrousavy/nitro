//
//  MemoryHelper.swift
//  NitroModules
//
//  Created by Marc Rousavy on 17.12.2024.
//

import Foundation

public final class MemoryHelper {
  /**
   * Get the memory size of the given instance.
   * This only accounts for stack allocated member variables,
   * not for externally allocated heap allocations like images or buffers.
   */
  public static func getSizeOf(_ instance: AnyObject) -> Int {
    return malloc_size(Unmanaged.passUnretained(instance).toOpaque())
  }
}
