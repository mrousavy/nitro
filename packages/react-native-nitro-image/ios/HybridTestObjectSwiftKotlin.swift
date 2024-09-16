//
//  HybridSwiftKotlinTestObject.swift
//  NitroImage
//
//  Created by Marc Rousavy on 11.08.24.
//

import Foundation
import NitroModules

class HybridTestObjectSwiftKotlin : HybridTestObjectSwiftKotlinSpec {
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
  
  func callCallback(callback: @escaping (() -> Void)) throws {
    callback()
  }
  
  var hybridContext: margelo.nitro.HybridContext = .init()
  
  var memorySize: Int {
    return 0
  }
  
  func createMap() throws -> AnyMapHolder {
    let map = AnyMapHolder()
    map.setDouble(key: "number", value: numberValue)
    map.setBoolean(key: "bool", value: boolValue)
    map.setString(key: "string", value: stringValue)
    map.setBigInt(key: "bigint", value: bigintValue)
    map.setNull(key: "null")
    // TODO: Arrays are not supported yet on Swift AnyMap
    // map.setArray(
    map.setObject(key: "object", value: [
      "number": .number(numberValue),
      "bool": .bool(boolValue),
      "string": .string(stringValue),
      "bigint": .bool(boolValue),
      "null": .null,
      // TODO: Arrays are not supported yet on Swift AnyValue
      // "array": .array(
    ])
    return map
  }
  
  var thisObject: any HybridTestObjectSwiftKotlinSpec {
    return self
  }
  
  func newTestObject() throws -> any HybridTestObjectSwiftKotlinSpec {
    return HybridTestObjectSwiftKotlin()
  }
  
  func mapRoundtrip(map: AnyMapHolder) throws -> AnyMapHolder {
    return map
  }
  
  func funcThatThrows() throws -> Double {
    // TODO: Swift functions can not throw yet! Errors are not propagated up to C++.
    // throw RuntimeError.error(withMessage: "This function will only work after sacrificing seven lambs!")
    return 55
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
  
  func calculateFibonacciSync(value: Double) throws -> Int64 {
    let n = Int64(value)
    if n <= 1 {
        return n
    }

    var a = Int64(0)
    var b = Int64(1)
    for _ in 2...n {
        let temp = a + b
        a = b
        b = temp
    }
    return b
  }
  
  func calculateFibonacciAsync(value: Double) throws -> Promise<Int64> {
    return Promise.async {
      return try self.calculateFibonacciSync(value: value)
    }
  }
  
  func wait(seconds: Double) throws -> Promise<Void> {
    return Promise.async {
      try await Task.sleep(nanoseconds: 5 * 1_000_000)
    }
  }
  
  func callAll(first: @escaping (() -> Void), second: @escaping (() -> Void), third: @escaping (() -> Void)) throws {
    first()
    second()
    third()
  }
  
  func getCar() throws -> Car {
    return Car(year: 2018, make: "Lamborghini", model: "Huracán", power: 640, powertrain: .gas, driver: nil)
  }
  
  func isCarElectric(car: Car) throws -> Bool {
    return car.powertrain == .electric
  }
  
  func getDriver(car: Car) throws -> Person? {
    return car.driver
  }
  
  func createArrayBuffer() throws -> ArrayBufferHolder {
    return .allocate(size: 1024 * 1024 * 10) // 10 MB
  }
  
  func getBufferLastItem(buffer: ArrayBufferHolder) throws -> Double {
    let lastBytePointer = buffer.data.advanced(by: buffer.size - 1)
    let lastByte = lastBytePointer.load(as: UInt8.self)
    return Double(lastByte)
  }
  
  func setAllValuesTo(buffer: ArrayBufferHolder, value: Double) throws {
    memset(buffer.data, Int32(value), buffer.size)
  }
}
