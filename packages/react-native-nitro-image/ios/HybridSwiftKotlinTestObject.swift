//
//  HybridSwiftKotlinTestObject.swift
//  NitroImage
//
//  Created by Marc Rousavy on 11.08.24.
//

import Foundation
import NitroModules

class HybridSwiftKotlinTestObject : HybridSwiftKotlinTestObjectSpec {
  var hybridContext = margelo.nitro.HybridContext()
  var memorySize: Int {
    return getSizeOf(self)
  }
  
  var numberValue: Double
  var boolValue: Bool
  var stringValue: String
  var bigintValue: Int64
  var stringOrUndefined: String?
  var stringOrNull: String?
  var optionalString: String?
  var valueThatWillThrowOnAccess: Double
  var someTuple: (Double, String)
  
  init() {
    
  }
  
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
    print("Arguments received! num \(num) | str: \(str) | boo: \(boo)")
  }
  
  func funcThatThrows() throws -> Double {
    throw RuntimeError.error(withMessage: "This function will only work after sacrificing seven lambs!")
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
  
  func flip(tuple: (Double, Double, Double)) throws -> (Double, Double, Double) {
    return (tuple.2, tuple.1, tuple.0)
  }
  
  func passTuple(tuple: (Double, String, Bool)) throws -> (Double, String, Bool) {
    return tuple
  }
  
  func calculateFibonacciSync(value: Double) throws -> Int64 {
    return calculateFibonacci(of: Int(value))
  }
  
  func calculateFibonacciAsync(value: Double) async throws -> Int64 {
    return calculateFibonacci(of: Int(value))
  }
  
  func wait(seconds: Double) async throws {
    try await Task.sleep(nanoseconds: 1_000_000_000)
  }
  
  func callCallback(callback: margelo.nitro.image.Func_void) throws {
    callback()
  }
  
  func callAll(first: margelo.nitro.image.Func_void, second: margelo.nitro.image.Func_void, third: margelo.nitro.image.Func_void) throws {
    first()
    second()
    third()
  }
  
  func getCar() throws -> margelo.nitro.image.Car {
    return margelo.nitro.image.Car(2018, "Lamborghini", "Huracan Performante", 640, .gas, nil)
  }
  
  func isCarElectric(car: margelo.nitro.image.Car) throws -> Bool {
    return car.powertrain == .gas
  }
  
  func getDriver(car: margelo.nitro.image.Car) throws -> margelo.nitro.image.Person? {
    if car.driver.hasValue {
      return car.driver.value!
    } else {
      return nil
    }
  }
  
  func calculateFibonacci(of count: Int) -> Int64 {
    if (count <= 0) {
      return 0
    }
    if (count == 1) {
      return 1
    }

    return calculateFibonacci(of: count - 1) + calculateFibonacci(of: count - 2)
  }
}
