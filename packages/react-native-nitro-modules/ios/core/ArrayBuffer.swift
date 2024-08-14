//
//  ArrayBuffer.swift
//  NitroModules
//
//  Created by Marc Rousavy on 17.07.24.
//

import Foundation

public typealias ArrayBuffer = margelo.nitro.ArrayBuffer
public typealias NativeArrayBuffer = margelo.nitro.NativeArrayBuffer
public typealias JSArrayBuffer = margelo.nitro.JSArrayBuffer
public typealias ArrayBufferHolder = margelo.nitro.ArrayBufferHolder

public extension ArrayBuffer {
  static func createBuffer(wrappingDataWithoutCopy data: UnsafeMutablePointer<UInt8>,
                           size: Int,
                           onDelete delete: @escaping () -> Void) -> ArrayBufferHolder {
    // Convert escaping Swift closure to a `void*`
    let wrappedClosure = Unmanaged.passUnretained(ClosureWrapper(closure: delete)).toOpaque()
    
    return ArrayBufferHolder.makeBuffer(data, size, { context in
      guard let context else {
        fatalError("Context was null, even though we created one!")
      }
      // Convert `void*` to a Swift closure
      let closure = Unmanaged<ClosureWrapper>.fromOpaque(context).takeUnretainedValue()
      // Call it (deleteFunc)
      closure.invoke()
    }, wrappedClosure)
  }
}
