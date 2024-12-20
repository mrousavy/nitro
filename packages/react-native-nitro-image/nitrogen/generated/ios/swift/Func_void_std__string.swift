///
/// Func_void_std__string.swift
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

/**
 * Represents the JS function `(valueFromJs: string) => void`, wrappable as a C++ std::function.
 */
public class Func_void_std__string final {
  private let closure: ((_ valueFromJs: String) -> Void)

  public init(_ closure: @escaping ((_ valueFromJs: String) -> Void)) {
    self.closure = closure
  }

  public func call(valueFromJs: std.string) -> Void {
    let __result: Void = self.closure(String(valueFromJs))
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
   * Casts an unsafe pointer to a `Func_void_std__string`.
   * The pointer has to be a retained opaque `Unmanaged<Func_void_std__string>`.
   * This removes one strong reference from the object!
   */
  public static func fromUnsafe(_ pointer: UnsafeMutableRawPointer) -> Func_void_std__string {
    return Unmanaged<Func_void_std__string>.fromOpaque(pointer).takeRetainedValue()
  }
}
