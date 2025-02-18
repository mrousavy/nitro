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

// pragma MARK: Wrap

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
    return ArrayBufferHolder.wrap(data, size, swiftClosure)
  }

  /**
   * Create a new `ArrayBufferHolder` that wraps the given `data` of the given `size`
   * without performing a copy.
   * When the `ArrayBuffer` is no longer used, `onDelete` will be called, in which
   * you as a caller are responsible for deleting `data`.
   */
  static func wrap(dataWithoutCopy data: UnsafeMutableRawPointer,
                   size: Int,
                   onDelete delete: @escaping () -> Void) -> ArrayBufferHolder {
    return ArrayBufferHolder.wrap(dataWithoutCopy: data.assumingMemoryBound(to: UInt8.self),
                                  size: size,
                                  onDelete: delete)
  }
}

// pragma MARK: Allocate

public extension ArrayBufferHolder {
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
    return ArrayBufferHolder.wrap(data, size, deleteFunc)
  }
}

// pragma MARK: Copy

public extension ArrayBufferHolder {
  /**
   * Copy the given `UnsafeMutablePointer<UInt8>` into a new **owning** `ArrayBufferHolder`.
   */
  static func copy(of other: UnsafeMutablePointer<UInt8>,
                   size: Int) -> ArrayBufferHolder {
    // 1. Create new `UnsafeMutablePointer<UInt8>`
    let copy = UnsafeMutablePointer<UInt8>.allocate(capacity: size)
    // 2. Copy over data
    copy.initialize(from: other, count: size)
    // 3. Create memory safe destroyer
    let deleteFunc = SwiftClosure {
      copy.deallocate()
    }
    return ArrayBufferHolder.wrap(copy, size, deleteFunc)
  }

  /**
   * Copy the given `UnsafeMutableRawPointer` into a new **owning** `ArrayBufferHolder`.
   */
  static func copy(of other: UnsafeMutableRawPointer,
                   size: Int) -> ArrayBufferHolder {
    return ArrayBufferHolder.copy(of: other.assumingMemoryBound(to: UInt8.self),
                                  size: size)
  }

  /**
   * Copy the given `ArrayBufferHolder` into a new **owning** `ArrayBufferHolder`.
   */
  static func copy(of other: ArrayBufferHolder) -> ArrayBufferHolder {
    return ArrayBufferHolder.copy(of: other.data, size: other.size)
  }

  /**
   * Copy the given `Data` into a new **owning** `ArrayBufferHolder`.
   */
  static func copy(data: Data) throws -> ArrayBufferHolder {
    // 1. Create new `ArrayBuffer` of same size
    let size = data.count
    let arrayBuffer = ArrayBufferHolder.allocate(size: size)
    // 2. Copy all bytes from `Data` into our new `ArrayBuffer`
    try data.withUnsafeBytes { rawPointer in
      guard let baseAddress = rawPointer.baseAddress else {
        throw RuntimeError.error(withMessage: "Cannot get baseAddress of Data!")
      }
      memcpy(arrayBuffer.data, baseAddress, size)
    }
    return arrayBuffer
  }
}


// pragma MARK: Data

public extension ArrayBufferHolder {
  /**
   * Wrap this `ArrayBufferHolder` in a `Data` instance, without performing a copy.
   * - `copyIfNeeded`: If this `ArrayBuffer` is **non-owning**, the foreign
   *                   data may needs to be copied to be safely used outside of the scope of the caller function.
   *                   This flag controls that.
   */
  func toData(copyIfNeeded: Bool) -> Data {
    let shouldCopy = copyIfNeeded && !self.isOwner
    if shouldCopy {
      // COPY DATA
      return Data.init(bytes: self.data, count: self.size)
    } else {
      // WRAP DATA
      // 1. Get the std::shared_ptr<ArrayBuffer>
      var sharedPointer = self.getArrayBuffer()
      // 2. Create a Data object WRAPPING our pointer
      return Data(bytesNoCopy: self.data, count: self.size, deallocator: .custom({ buffer, size in
        // 3. Capture the std::shared_ptr<ArrayBuffer> in the deallocator lambda so it stays alive.
        //    As soon as this lambda gets called, the `sharedPointer` gets deleted causing the
        //    underlying `ArrayBuffer` to be freed.
        sharedPointer.reset()
      }))
    }
  }
}
