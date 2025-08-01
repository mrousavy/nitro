///
/// Func_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____.swift
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

import NitroModules


/**
 * Wraps a Swift `() -> Promise<Promise<ArrayBuffer>>` as a class.
 * This class can be used from C++, e.g. to wrap the Swift closure as a `std::function`.
 */
public final class Func_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____ {
  public typealias bridge = margelo.nitro.test.bridge.swift

  private let closure: () -> Promise<Promise<ArrayBuffer>>

  public init(_ closure: @escaping () -> Promise<Promise<ArrayBuffer>>) {
    self.closure = closure
  }

  @inline(__always)
  public func call() -> bridge.std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____ {
    let __result: Promise<Promise<ArrayBuffer>> = self.closure()
    return { () -> bridge.std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____ in
      let __promise = bridge.create_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____()
      let __promiseHolder = bridge.wrap_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____(__promise)
      __result
        .then({ __result in __promiseHolder.resolve({ () -> bridge.std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer___ in
            let __promise = bridge.create_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer___()
            let __promiseHolder = bridge.wrap_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer___(__promise)
            __result
              .then({ __result in __promiseHolder.resolve(__result.getArrayBuffer()) })
              .catch({ __error in __promiseHolder.reject(__error.toCpp()) })
            return __promise
          }()) })
        .catch({ __error in __promiseHolder.reject(__error.toCpp()) })
      return __promise
    }()
  }

  /**
   * Casts this instance to a retained unsafe raw pointer.
   * This acquires one additional strong reference on the object!
   */
  @inline(__always)
  public func toUnsafe() -> UnsafeMutableRawPointer {
    return Unmanaged.passRetained(self).toOpaque()
  }

  /**
   * Casts an unsafe pointer to a `Func_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____`.
   * The pointer has to be a retained opaque `Unmanaged<Func_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____>`.
   * This removes one strong reference from the object!
   */
  @inline(__always)
  public static func fromUnsafe(_ pointer: UnsafeMutableRawPointer) -> Func_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____ {
    return Unmanaged<Func_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____>.fromOpaque(pointer).takeRetainedValue()
  }
}
