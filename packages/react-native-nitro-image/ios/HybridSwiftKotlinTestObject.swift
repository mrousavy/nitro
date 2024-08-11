//
//  HybridSwiftKotlinTestObject.swift
//  NitroImage
//
//  Created by Marc Rousavy on 11.08.24.
//

import Foundation

class HybridSwiftKotlinTestObject : HybridSwiftKotlinTestObjectSpec {
  var hybridContext = margelo.nitro.HybridContext()
  var memorySize: Int {
    return getSizeOf(self)
  }
  
  func hallo(value: Double?) throws {
    print("hallo")
  }
}
