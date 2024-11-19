//
//  HybridTestObjectSwift.swift
//  NitroImage
//
//  Created by Marc Rousavy on 11.08.24.
//

import Foundation
import NitroModules

class HybridTestObjectSwift : HybridTestObjectSwiftKotlinSpec {
  var hybridContext: margelo.nitro.HybridContext = .init()
  var memorySize: Int {
    return 0
  }

  var optionalArray: [String]? = []

  var someVariant: Variant_String_Double = .someDouble(55)

  var numberValue: Double = 0.0

  var boolValue: Bool = false

  var stringValue: String = ""

  var bigintValue: Int64 = 0

  var stringOrUndefined: String? = nil

  var stringOrNull: String? = nil

  var optionalString: String? = nil

  var optionalHybrid: (any HybridTestObjectSwiftKotlinSpec)? = nil

  var optionalEnum: Powertrain? = nil

  var optionalOldEnum: OldEnum? = nil

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

  func callWithOptional(value: Double?, callback: @escaping ((_ maybe: Double?) -> Void)) throws -> Void {
    callback(value)
  }

  func bounceStrings(array: [String]) throws -> [String] {
    return array
  }

  func bounceNumbers(array: [Double]) throws -> [Double] {
    return array
  }

  func bounceStructs(array: [Person]) throws -> [Person] {
    return array
  }

  func bounceEnums(array: [Powertrain]) throws -> [Powertrain] {
    return array
  }

  func complexEnumCallback(array: [Powertrain], callback: @escaping ((_ array: [Powertrain]) -> Void)) throws -> Void {
    callback(array)
  }

  func createMap() throws -> AnyMapHolder {
    let map = AnyMapHolder()
    map.setDouble(key: "number", value: numberValue)
    map.setBoolean(key: "bool", value: boolValue)
    map.setString(key: "string", value: stringValue)
    map.setBigInt(key: "bigint", value: bigintValue)
    map.setNull(key: "null")
    let array: [AnyValue] = [.number(numberValue), .bool(boolValue), .string(stringValue), .bigint(bigintValue)]
    map.setArray(key: "array", value: array)
    map.setObject(key: "object", value: [
      "number": .number(numberValue),
      "bool": .bool(boolValue),
      "string": .string(stringValue),
      "bigint": .bigint(bigintValue),
      "null": .null,
      "array": .array([.number(numberValue), .bool(boolValue), .string(stringValue), .bigint(bigintValue), .array(array)])
    ])
    return map
  }

  var thisObject: any HybridTestObjectSwiftKotlinSpec {
    return self
  }

  func newTestObject() throws -> any HybridTestObjectSwiftKotlinSpec {
    return HybridTestObjectSwift()
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

  func tryOptionalEnum(value: Powertrain?) throws -> Powertrain? {
    return value
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
      try await Task.sleep(nanoseconds: UInt64(seconds) * 1_000_000_000)
    }
  }

  func promiseThrows() throws -> Promise<Void> {
    return Promise.async {
      throw RuntimeError.error(withMessage: "Promise throws :)")
    }
  }
  
  func awaitPromise(promise: Promise<Double>) throws -> Promise<Double> {
    return .async {
      let result = try await promise.await()
      return result
    }
  }

  func callAll(first: @escaping (() -> Void), second: @escaping (() -> Void), third: @escaping (() -> Void)) throws {
    first()
    second()
    third()
  }

  func getCar() throws -> Car {
    return Car(year: 2018, make: "Lamborghini", model: "Huracán", power: 640, powertrain: .gas, driver: nil, isFast: true)
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

  func createArrayBufferAsync() throws -> Promise<ArrayBufferHolder> {
    return Promise.async { try self.createArrayBuffer() }
  }

  func getBufferLastItem(buffer: ArrayBufferHolder) throws -> Double {
    let lastBytePointer = buffer.data.advanced(by: buffer.size - 1)
    let lastByte = lastBytePointer.load(as: UInt8.self)
    return Double(lastByte)
  }

  func setAllValuesTo(buffer: ArrayBufferHolder, value: Double) throws {
    memset(buffer.data, Int32(value), buffer.size)
  }

  func createChild() throws -> any HybridChildSpec {
    return HybridChild()
  }

  func createBase() throws -> any HybridBaseSpec {
    return HybridBase()
  }

  func createBaseActualChild() throws -> any HybridBaseSpec {
    return HybridChild()
  }

  func bounceChild(child: any HybridChildSpec) throws -> any HybridChildSpec {
    return child
  }

  func bounceBase(base: any HybridBaseSpec) throws -> any HybridBaseSpec {
    return base
  }

  func bounceChildBase(child: any HybridChildSpec) throws -> any HybridBaseSpec {
    return child
  }

  func castBase(base: any HybridBaseSpec) throws -> any HybridChildSpec {
    guard let child = base as? HybridChildSpec else {
      throw RuntimeError.error(withMessage: "Cannot cast Base to Child!")
    }
    return child
  }
}
