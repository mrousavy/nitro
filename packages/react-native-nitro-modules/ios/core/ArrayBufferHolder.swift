//
//  ArrayBufferHolder.swift
//  NitroModules
//
//  Created by Marc Rousavy on 17.07.24.
//

import Foundation

/**
 * Holds instances of `std::shared_ptr<ArrayBuffer>`, which can be passed
 * between native and JS **without copy**.
 *
 * See `data`, `size` and `isOwning`.
 */
public typealias ArrayBufferHolder = margelo.nitro.ArrayBufferHolder

public extension ArrayBufferHolder {
  /**
   * Create a new `ArrayBufferHolder` that wraps the given `data` of the given `size`
   * without performing a copy.
   * When the `ArrayBuffer` is no longer used, `onDelete` will be called, in which
   * you as a caller are responsible for deleting `data`.
   */
  static func wrap(dataWithoutCopy data: UnsafeMutablePointer<UInt8>,
                   size: Int,
                   onDelete delete: @escaping () -> Void) -> ArrayBufferHolder {
    // Convert escaping Swift closure to a `void*`
    let swiftClosure = SwiftClosure(wrappingClosure: delete)
    // Create ArrayBufferHolder with our wrapped Swift closure to make it callable as a C-function pointer
    return ArrayBufferHolder.makeBuffer(data, size, swiftClosure)
  }

  /**
   * Allocate a new buffer of the given `size`.
   * If `initializeToZero` is `true`, all bytes are set to `0`, otherwise they are left untouched.
   */
  static func allocate(size: Int, initializeToZero: Bool = false) -> ArrayBufferHolder {
    let data = UnsafeMutablePointer<UInt8>.allocate(capacity: size)
    if initializeToZero {
      data.initialize(repeating: 0, count: size)
    }

    let deleteFunc = SwiftClosure {
      data.deallocate()
    }
    return ArrayBufferHolder.makeBuffer(data, size, deleteFunc)
  }

  /**
   * Copy the given `ArrayBufferHolder` into a new **owning** `ArrayBufferHolder`.
   */
  static func copy(of other: ArrayBufferHolder) -> ArrayBufferHolder {
    let data = UnsafeMutablePointer<UInt8>.allocate(capacity: other.size)
    let pointer = other.data.assumingMemoryBound(to: UInt8.self)
    data.initialize(from: pointer, count: other.size)

    let deleteFunc = SwiftClosure {
      data.deallocate()
    }
    return ArrayBufferHolder.makeBuffer(data, other.size, deleteFunc)
  }
}
