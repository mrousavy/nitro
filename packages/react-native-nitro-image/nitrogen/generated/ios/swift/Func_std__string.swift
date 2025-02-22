///
/// Func_std__string.swift
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

import NitroModules

/**
 * Wraps a Swift `() -> String` as a class.
 * This class can be used from C++, e.g. to wrap the Swift closure as a `std::function`.
 */
public final class Func_std__string {
  public typealias bridge = margelo.nitro.image.bridge.swift

  private let closure: () -> String

  public init(_ closure: @escaping () -> String) {
    self.closure = closure
  }

  @inline(__always)
  public func call() -> std.string {
    let __result: String = self.closure()
    return std.string(__result)
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
   * Casts an unsafe pointer to a `Func_std__string`.
   * The pointer has to be a retained opaque `Unmanaged<Func_std__string>`.
   * This removes one strong reference from the object!
   */
  @inline(__always)
  public static func fromUnsafe(_ pointer: UnsafeMutableRawPointer) -> Func_std__string {
    return Unmanaged<Func_std__string>.fromOpaque(pointer).takeRetainedValue()
  }
}
