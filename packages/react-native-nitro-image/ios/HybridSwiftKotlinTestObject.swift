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
  
  var numberValue: Double = 0.0
  var boolValue: Bool = false
  var stringValue: String = ""
  var bigintValue: Int64 = 0
  var stringOrUndefined: String? = nil
  var stringOrNull: String? = nil
  var optionalString: String? = nil
  
  func simpleFunc() throws {
    // do nothing
  }
  
  func addNumbers(a: Double, b: Double) throws -> Double {
    return a + b
  }
  
  func addStrings(a: String, b: String) throws -> String {
    return a + b
  }
  
  func multipleArguments(num: Double, str: String, boo: Bool) throws {
    print("Arguments received! num: \(num) | str: \(str) | boo: \(boo)")
  }
  
  func getNumbers() throws -> [Double] {
    return [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  }
  
  func getStrings() throws -> [String] {
    return ["h", "e", "ll", "o"]
  }
}
