//
//  HybridSwiftKotlinTestObject.swift
//  NitroImage
//
//  Created by Marc Rousavy on 11.08.24.
//

import Foundation
import NitroModules

class HybridSwiftKotlinTestObject : HybridSwiftKotlinTestObjectSpec {
  func getHolder() throws -> ComplexHolder {
    return ComplexHolder(first: ["value": "hello"])
  }
  
  
  func getStringAsync() throws -> Promise<String> {
    return Promise.parallel {
      Thread.sleep(forTimeInterval: 1)
      return "hello from Swift!"
    }
  }
  
  func getCarAsync() throws -> Promise<Car> {
    return Promise.parallel {
      Thread.sleep(forTimeInterval: 1)
      let driver = Person(name: "Marc", age: 24)
      return Car(year: 2018, make: "Lamborghini", model: "Huracan", power: 640, powertrain: .gas, driver: driver)
    }
  }
  
  func getNumberAsync() throws -> Promise<Double> {
    return Promise.parallel {
      Thread.sleep(forTimeInterval: 1)
      return 13
    }
  }
  
  func call(args: CallbackHolder) throws {
    args.callback()
  }
  
  func call(callMeMaybe: ((String) -> Void)?) throws {
    // do nothing
  }
  
  func newTestObject() throws -> any HybridSwiftKotlinTestObjectSpec {
    return HybridSwiftKotlinTestObject()
  }
  func bounceBack(obj: any HybridSwiftKotlinTestObjectSpec) throws -> any HybridSwiftKotlinTestObjectSpec {
    return obj
  }
  
  var person: Person = Person("Hello", 21)
  
  var car: Car? = .init(year: 2018, make: "Lamborghini", model: "Huracan", power: 640, powertrain: .gas, driver: nil)
  
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
  var buffer: ArrayBufferHolder = .allocate(size: 1024, initializeToZero: true)
  
  func createNewBuffer(size: Double) throws -> ArrayBufferHolder {
    return .allocate(size: Int(size))
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
  
  var someMap: AnyMapHolder = .init()
  
  var someRecord: Dictionary<String, Double> {
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
