//
//  ArrayBuffer.swift
//  NitroModules
//
//  Created by Marc Rousavy on 17.07.24.
//

import Foundation

public typealias ArrayBufferHolder = margelo.nitro.ArrayBufferHolder

public extension ArrayBufferHolder {
  /**
   * Create a new `ArrayBufferHolder` that wraps the given `data` of the given `size`
   * without performing a copy.
   * When the `ArrayBuffer` is no longer used, `onDelete` will be called, in which
   * you as a caller are responsible for deleting `data`.
   */
  static func wrap(wrappingDataWithoutCopy data: UnsafeMutablePointer<UInt8>,
                   size: Int,
                   onDelete delete: @escaping () -> Void) -> ArrayBufferHolder {
    // Convert escaping Swift closure to a `void*`
    let wrapper = ClosureWrapper(closure: delete)
    let wrappedClosure = Unmanaged.passRetained(wrapper).toOpaque()
    
    return ArrayBufferHolder.makeBuffer(data, size, { context in
      guard let context else {
        fatalError("Context was null, even though we created one!")
      }
      // Convert `void*` to a Swift closure
      let closure = Unmanaged<ClosureWrapper>.fromOpaque(context).takeRetainedValue()
      // Call it (deleteFunc)
      closure.invoke()
    }, wrappedClosure)
  }
  
  /**
   * Allocate a new buffer of the given `size`.
   * If `initializeToZero` is `true`, all bytes are set to `0`, otherwise they are left untouched.
   */
  static func allocate(size: Int, initializeToZero: Bool = false) -> ArrayBufferHolder {
    let data = UnsafeMutablePointer<UInt8>.allocate(capacity: size)
    if initializeToZero {
      data.initialize(to: 0)
    }
    
    return ArrayBufferHolder.makeBuffer(data, size, { data in
      data?.deallocate()
    }, data)
  }
}
