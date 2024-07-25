//
//  DataArrayBuffer.swift
//  NitroModules
//
//  Created by Marc Rousavy on 25.07.24.
//

import Foundation

public class DataArrayBuffer {
  private var data: Data
  private let cppPart: margelo.nitro.ForeignArrayBuffer
  
  public init(data: Data) {
    self.data = data
    self.cppPart = margelo.nitro.ForeignArrayBuffer(.init(), .init(), .init())
  }
  
  public var size: Int {
    return data.count
  }
  
  public var bytes: UnsafeMutablePointer<UInt8> {
    var pointer: UnsafeMutablePointer<UInt8>? = nil
    data.withUnsafeMutableBytes({ (p: UnsafeMutableRawBufferPointer) in
      guard let baseAddress = p.baseAddress else {
        fatalError("Failed to get the base address from UnsafeMutableRawBufferPointer!")
      }
      pointer = baseAddress.assumingMemoryBound(to: UInt8.self)
    })
    guard let pointer else {
      fatalError("Failed to use Data.withUnsafeMutableBytes!")
    }
    return pointer
  }
}
