//
//  DataArrayBuffer.swift
//  NitroModules
//
//  Created by Marc Rousavy on 25.07.24.
//

import Foundation

public class DataBasedArrayBuffer {
  private var data: Data
  
  public init(data: Data) {
    self.data = data
  }
  
  public var size: Int {
    return data.count
  }
  
  public var bytes: UnsafeMutableRawPointer {
    var pointer: UnsafeMutableRawBufferPointer? = nil
    data.withUnsafeMutableBytes({ (p: UnsafeMutableRawBufferPointer) in
      pointer = p
    })
    return pointer!.baseAddress!
  }
}
