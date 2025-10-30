//
//  UnsafeTransferable.swift
//  NitroModules
//
//  Created by Marc Rousavy on 30.10.2025.
//

import Foundation

public protocol UnsafeTransferable: AnyObject {
  func toUnsafeRetained() -> UnsafeMutableRawPointer
  static func fromUnsafeRetained(_ pointer: UnsafeMutableRawPointer) -> Self

  func toUnsafeUnretained() -> UnsafeMutableRawPointer
  static func fromUnsafeUnretained(_ pointer: UnsafeMutableRawPointer) -> Self
}
public extension UnsafeTransferable {
  func toUnsafeRetained() -> UnsafeMutableRawPointer {
    return Unmanaged.passRetained(self).toOpaque()
  }
  static func fromUnsafeRetained(_ pointer: UnsafeRawPointer) -> Self {
    return Unmanaged<Self>.fromOpaque(pointer).takeRetainedValue()
  }

  func toUnsafeUnretained() -> UnsafeMutableRawPointer {
    return Unmanaged.passUnretained(self).toOpaque()
  }
  static func fromUnsafeUnretained(_ pointer: UnsafeRawPointer) -> Self {
    return Unmanaged<Self>.fromOpaque(pointer).takeUnretainedValue()
  }
}
