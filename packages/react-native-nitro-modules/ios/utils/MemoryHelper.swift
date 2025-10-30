//
//  MemoryHelper.swift
//  NitroModules
//
//  Created by Marc Rousavy on 17.12.2024.
//

import Foundation

public final class MemoryHelper {
  /**
   * Get the amount of memory that was allocated using a `malloc`-like allocator
   * for the given instance, in bytes.
   * When allocating resources differently (e.g. GPU buffers, or `UIImage`) you
   * should add their byte sizes to the result of this function to get an object's
   * total memory footprint.
   */
  public static func getSizeOf(_ instance: AnyObject) -> Int {
    return malloc_size(Unmanaged.passUnretained(instance).toOpaque())
  }

  /**
   * Increments the ref-count on the unsafe Swift reference by +1.
   * The ref-count needs to be decremented again later to avoid leaks.
   */
  public static func retainOne(_ unsafe: UnsafeRawPointer) {
    Unmanaged<AnyObject>.fromOpaque(unsafe).retain()
  }
  /**
   * Decrements the ref-count on the unsafe Swift reference by -1.
   * If the ref-count reaches 0, the object will be deallocated.
   */
  public static func releaseOne(_ unsafe: UnsafeRawPointer) {
    Unmanaged<AnyObject>.fromOpaque(unsafe).release()
  }

  public static func castUnsafe<T>(_ unsafe: UnsafeRawPointer) -> T {
    let anyObject = Unmanaged<AnyObject>.fromOpaque(unsafe).takeUnretainedValue()
    #if DEBUG
      guard let object = anyObject as? T else {
        fatalError("Object \(unsafe) cannot be casted to type \(String(describing: T.self))!")
      }
      return object
    #else
      return anyObject as! T
    #endif
  }
}
