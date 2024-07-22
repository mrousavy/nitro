//
//  ArrayBuffer.swift
//  NitroModules
//
//  Created by Marc Rousavy on 22.07.24.
//

import Foundation

public class CxxPartHolder {
  public let cxxPart: margelo.nitro.ArrayBufferSwift
  
  init(cxxPart: margelo.nitro.ArrayBufferSwift) {
    self.cxxPart = cxxPart
  }
}

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
  private weak var weakCxxPart: CxxPartHolder? = nil
  
  public init(withBuffer buffer: UnsafeMutablePointer<UInt8>, ofSize size: Int) {
    self.buffer = buffer
    self.bufferSize = size
  }
  
  deinit {
    buffer.deallocate()
  }
  
  public var cxxPart: CxxPartHolder {
    get {
      if let holder = weakCxxPart {
        return holder
      } else {
        let arrayBuffer = margelo.nitro.ArrayBufferSwift(self)
        let holder = CxxPartHolder(cxxPart: arrayBuffer)
        self.weakCxxPart = holder
        return holder
      }
    }
  }
  
  public var data: UnsafeMutablePointer<UInt8> {
    return buffer
  }
  
  public var size: Int {
    return bufferSize
  }
}
