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
  
  func createNumbers() throws -> [Double] {
    return [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  }
  
  func createStrings() throws -> [String] {
    return ["h", "e", "ll", "o"]
  }
  
  func tryOptionalParams(num: Double, boo: Bool, str: String?) throws -> String {
    if let str {
      return str
    } else {
      return "value omitted!"
    }
  }
  
  func tryMiddleParam(num: Double, boo: Bool?, str: String) throws -> String {
    return str
  }
  
  func getCar() throws -> margelo.nitro.image.Car {
    var car = margelo.nitro.image.Car(2018, "Lamborghini", "Huracan Performante", 640, .gas, .init(nilLiteral: ()))
    car.driver = margelo.nitro.image.Person("Marc", 24)
    return car
  }
  
  func isCarElectric(car: margelo.nitro.image.Car) throws -> Bool {
    return car.powertrain == .electric
  }
  
  func getDriver(car: margelo.nitro.image.Car) throws -> margelo.nitro.image.Person? {
    return nil
  }
}
