///
/// HybridTestObjectSwiftKotlinSpec.swift
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

import Foundation
import NitroModules

/// See ``HybridTestObjectSwiftKotlinSpec``
public protocol HybridTestObjectSwiftKotlinSpec_protocol: HybridObject {
  // Properties
  var thisObject: (any HybridTestObjectSwiftKotlinSpec) { get }
  var optionalHybrid: (any HybridTestObjectSwiftKotlinSpec)? { get set }
  var numberValue: Double { get set }
  var boolValue: Bool { get set }
  var stringValue: String { get set }
  var bigintValue: Int64 { get set }
  var stringOrUndefined: String? { get set }
  var stringOrNull: String? { get set }
  var optionalString: String? { get set }
  var optionalArray: [String]? { get set }
  var optionalEnum: Powertrain? { get set }
  var optionalOldEnum: OldEnum? { get set }
  var optionalCallback: ((_ value: Double) -> Void)? { get set }
  var someVariant: Variant2<String, Double> { get set }

  // Methods
  func newTestObject() throws -> (any HybridTestObjectSwiftKotlinSpec)
  func simpleFunc() throws -> Void
  func addNumbers(a: Double, b: Double) throws -> Double
  func addStrings(a: String, b: String) throws -> String
  func multipleArguments(num: Double, str: String, boo: Bool) throws -> Void
  func bounceStrings(array: [String]) throws -> [String]
  func bounceNumbers(array: [Double]) throws -> [Double]
  func bounceStructs(array: [Person]) throws -> [Person]
  func bounceEnums(array: [Powertrain]) throws -> [Powertrain]
  func complexEnumCallback(array: [Powertrain], callback: @escaping (_ array: [Powertrain]) -> Void) throws -> Void
  func createMap() throws -> AnyMapHolder
  func mapRoundtrip(map: AnyMapHolder) throws -> AnyMapHolder
  func bounceMap(map: Dictionary<String, Variant2<Double, Bool>>) throws -> Dictionary<String, Variant2<Double, Bool>>
  func extractMap(mapWrapper: MapWrapper) throws -> Dictionary<String, String>
  func funcThatThrows() throws -> Double
  func funcThatThrowsBeforePromise() throws -> Promise<Void>
  func throwError(error: Error) throws -> Void
  func tryOptionalParams(num: Double, boo: Bool, str: String?) throws -> String
  func tryMiddleParam(num: Double, boo: Bool?, str: String) throws -> String
  func tryOptionalEnum(value: Powertrain?) throws -> Powertrain?
  func calculateFibonacciSync(value: Double) throws -> Int64
  func calculateFibonacciAsync(value: Double) throws -> Promise<Int64>
  func wait(seconds: Double) throws -> Promise<Void>
  func promiseThrows() throws -> Promise<Void>
  func awaitAndGetPromise(promise: Promise<Double>) throws -> Promise<Double>
  func awaitAndGetComplexPromise(promise: Promise<Car>) throws -> Promise<Car>
  func awaitPromise(promise: Promise<Void>) throws -> Promise<Void>
  func callCallback(callback: @escaping () -> Void) throws -> Void
  func callAll(first: @escaping () -> Void, second: @escaping () -> Void, third: @escaping () -> Void) throws -> Void
  func callWithOptional(value: Double?, callback: @escaping (_ maybe: Double?) -> Void) throws -> Void
  func callSumUpNTimes(callback: @escaping () -> Promise<Double>, n: Double) throws -> Promise<Double>
  func callbackAsyncPromise(callback: @escaping () -> Promise<Promise<Double>>) throws -> Promise<Double>
  func callbackAsyncPromiseBuffer(callback: @escaping () -> Promise<Promise<ArrayBufferHolder>>) throws -> Promise<ArrayBufferHolder>
  func getComplexCallback() throws -> (_ value: Double) -> Void
  func getValueFromJSCallbackAndWait(getValue: @escaping () -> Promise<Double>) throws -> Promise<Double>
  func getValueFromJsCallback(callback: @escaping () -> Promise<String>, andThenCall: @escaping (_ valueFromJs: String) -> Void) throws -> Promise<Void>
  func getCar() throws -> Car
  func isCarElectric(car: Car) throws -> Bool
  func getDriver(car: Car) throws -> Person?
  func jsStyleObjectAsParameters(params: JsStyleStruct) throws -> Void
  func createArrayBuffer() throws -> ArrayBufferHolder
  func getBufferLastItem(buffer: ArrayBufferHolder) throws -> Double
  func setAllValuesTo(buffer: ArrayBufferHolder, value: Double) throws -> Void
  func createArrayBufferAsync() throws -> Promise<ArrayBufferHolder>
  func createChild() throws -> (any HybridChildSpec)
  func createBase() throws -> (any HybridBaseSpec)
  func createBaseActualChild() throws -> (any HybridBaseSpec)
  func bounceChild(child: (any HybridChildSpec)) throws -> (any HybridChildSpec)
  func bounceBase(base: (any HybridBaseSpec)) throws -> (any HybridBaseSpec)
  func bounceChildBase(child: (any HybridChildSpec)) throws -> (any HybridBaseSpec)
  func castBase(base: (any HybridBaseSpec)) throws -> (any HybridChildSpec)
  func callbackSync(callback: @escaping () -> Double) throws -> Double
  func getIsViewBlue(view: (any HybridTestViewSpec)) throws -> Bool
}

/// See ``HybridTestObjectSwiftKotlinSpec``
public class HybridTestObjectSwiftKotlinSpec_base {
  private weak var cxxWrapper: HybridTestObjectSwiftKotlinSpec_cxx? = nil
  public func getCxxWrapper() -> HybridTestObjectSwiftKotlinSpec_cxx {
  #if DEBUG
    guard self is HybridTestObjectSwiftKotlinSpec else {
      fatalError("`self` is not a `HybridTestObjectSwiftKotlinSpec`! Did you accidentally inherit from `HybridTestObjectSwiftKotlinSpec_base` instead of `HybridTestObjectSwiftKotlinSpec`?")
    }
  #endif
    if let cxxWrapper = self.cxxWrapper {
      return cxxWrapper
    } else {
      let cxxWrapper = HybridTestObjectSwiftKotlinSpec_cxx(self as! HybridTestObjectSwiftKotlinSpec)
      self.cxxWrapper = cxxWrapper
      return cxxWrapper
    }
  }
}

/**
 * A Swift base-protocol representing the TestObjectSwiftKotlin HybridObject.
 * Implement this protocol to create Swift-based instances of TestObjectSwiftKotlin.
 * ```swift
 * class HybridTestObjectSwiftKotlin : HybridTestObjectSwiftKotlinSpec {
 *   // ...
 * }
 * ```
 */
public typealias HybridTestObjectSwiftKotlinSpec = HybridTestObjectSwiftKotlinSpec_protocol & HybridTestObjectSwiftKotlinSpec_base
