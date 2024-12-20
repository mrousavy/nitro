///
/// Func_void_std__vector_Powertrain_.swift
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

/**
 * Represents the JS function `(array: array) => void`, wrappable as a C++ std::function.
 */
public class Func_void_std__vector_Powertrain_ final {
  private let closure: ((_ array: [Powertrain]) -> Void)

  public init(_ closure: @escaping ((_ array: [Powertrain]) -> Void)) {
    self.closure = closure
  }

  public func call(array: bridge.std__vector_Powertrain_) -> Void {
    let __result: Void = self.closure(array.map({ __item in __item }))
    return 
  }

  /**
   * Casts this instance to a retained unsafe raw pointer.
   * This acquires one additional strong reference on the object!
   */
  public func toUnsafe() -> UnsafeMutableRawPointer {
    return Unmanaged.passRetained(self).toOpaque()
  }

  /**
   * Casts an unsafe pointer to a `Func_void_std__vector_Powertrain_`.
   * The pointer has to be a retained opaque `Unmanaged<Func_void_std__vector_Powertrain_>`.
   * This removes one strong reference from the object!
   */
  public static func fromUnsafe(_ pointer: UnsafeMutableRawPointer) -> Func_void_std__vector_Powertrain_ {
    return Unmanaged<Func_void_std__vector_Powertrain_>.fromOpaque(pointer).takeRetainedValue()
  }
}
