//
//  ArrayBuffer.swift
//  NitroModules
//
//  Created by Marc Rousavy on 22.07.24.
//

import Foundation

/**
 * A buffer of raw byte data.
 * ArrayBuffers can be read from and written to using both native (Swift, C++) and JS.
 *
 * Passing ArrayBuffers from Swift to JS (or vice versa) involves no copy operations.
 *
 * The `ArrayBuffer` owns the given `buffer` and deallocates it when it gets destroyed.
 */
public class ArrayBuffer {
  private let buffer: UnsafeMutablePointer<UInt8>
  private let bufferSize: Int
  
  public init(withBuffer buffer: UnsafeMutablePointer<UInt8>, ofSize size: Int) {
    self.buffer = buffer
    self.bufferSize = size
  }
  
  deinit {
    buffer.deallocate()
  }
  
  public var data: UnsafeMutablePointer<UInt8> {
    return buffer
  }
  
  public var size: Int {
    return bufferSize
  }
}
