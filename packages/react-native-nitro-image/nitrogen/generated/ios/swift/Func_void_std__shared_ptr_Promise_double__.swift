///
/// Func_void_std__shared_ptr_Promise_double__.swift
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

import NitroModules

/**
 * Wraps a Swift `(_ value: Promise<Double>) -> Void` as a class.
 * This class can be used from C++, e.g. to wrap the Swift closure as a `std::function`.
 */
public final class Func_void_std__shared_ptr_Promise_double__ {
  public typealias bridge = margelo.nitro.image.bridge.swift

  private let closure: (_ value: Promise<Double>) -> Void

  public init(_ closure: @escaping (_ value: Promise<Double>) -> Void) {
    self.closure = closure
  }

  @inline(__always)
  public func call(value: bridge.std__shared_ptr_Promise_double__) -> Void {
    self.closure({ () -> Promise<Double> in
      let __promise = Promise<Double>()
      let __resolver = { (__result: Double) in
        __promise.resolve(withResult: __result)
      }
      let __rejecter = { (__error: Error) in
        __promise.reject(withError: __error)
      }
      let __resolverCpp = { () -> bridge.Func_void_double in
        let __closureWrapper = Func_void_double(__resolver)
        return bridge.create_Func_void_double(__closureWrapper.toUnsafe())
      }()
      let __rejecterCpp = { () -> bridge.Func_void_std__exception_ptr in
        let __closureWrapper = Func_void_std__exception_ptr(__rejecter)
        return bridge.create_Func_void_std__exception_ptr(__closureWrapper.toUnsafe())
      }()
      let __promiseHolder = bridge.wrap_std__shared_ptr_Promise_double__(value)
      __promiseHolder.addOnResolvedListenerCopy(__resolverCpp)
      __promiseHolder.addOnRejectedListener(__rejecterCpp)
      return __promise
    }())
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
   * Casts an unsafe pointer to a `Func_void_std__shared_ptr_Promise_double__`.
   * The pointer has to be a retained opaque `Unmanaged<Func_void_std__shared_ptr_Promise_double__>`.
   * This removes one strong reference from the object!
   */
  @inline(__always)
  public static func fromUnsafe(_ pointer: UnsafeMutableRawPointer) -> Func_void_std__shared_ptr_Promise_double__ {
    return Unmanaged<Func_void_std__shared_ptr_Promise_double__>.fromOpaque(pointer).takeRetainedValue()
  }
}
