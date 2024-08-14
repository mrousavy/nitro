//
//  HybridSwiftKotlinTestObject.swift
//  NitroImage
//
//  Created by Marc Rousavy on 11.08.24.
//

import Foundation

class HybridSwiftKotlinTestObject : HybridSwiftKotlinTestObjectSpec {
  func newTestObject() throws -> any HybridSwiftKotlinTestObjectSpec {
    return HybridSwiftKotlinTestObject()
  }
  
  var person: Person = Person("Hello", 21)
  
  var car: Car? = .init(year: 2018, make: "Lamborghini", model: "Huracan", power: 740, powertrain: .gas, driver: nil)
  
  var powertrain: Powertrain = .gas
  var oldEnum: OldEnum = .first
  
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
  
  func callCallback(callback: @escaping () -> Void) throws {
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
      callback()
    }
  }
  
  var someMap: Dictionary<String, Double> {
    get {
      return [
        "hello": 55.0
      ]
    }
    set {
      
    }
  }
  
  var someArray: [String] {
    get {
      return ["hello"]
    }
    set {
      
    }
  }
  
  var someOptional: String? {
    get { return "Hello" }
    set {  }
  }
}
