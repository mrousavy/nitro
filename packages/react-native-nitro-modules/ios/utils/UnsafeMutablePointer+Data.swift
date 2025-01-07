//
//  SwiftClosure.swift
//  NitroModules
//
//  Created by Marc Rousavy on 07.01.24.
//

import Foundation

public extension UnsafeMutablePointer<UInt8> {
  /**
   * Create a new `UnsafeMutablePointer<UInt8>` by copying
   * the contents of the given `data`.
   */
  init(copyData data: Data) throws {
    let byteCount = data.count
    let newPointer = UnsafeMutablePointer<UInt8>.allocate(capacity: byteCount)
    
    try data.withUnsafeBytes { (rawBufferPointer) in
        guard let baseAddress = rawBufferPointer.baseAddress else {
          throw RuntimeError.error(withMessage: "Cannot get baseAddress of Data!")
        }
        memcpy(newPointer, baseAddress, byteCount)
    }
    
    self.init(newPointer)
  }
}
