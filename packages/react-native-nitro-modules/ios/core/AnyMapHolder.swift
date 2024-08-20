//
//  AnyMapHolder.swift
//  NitroModules
//
//  Created by Marc Rousavy on 20.08.24.
//

import Foundation

/**
 * Represents any value representable by the `AnyMap`.
 * Note: Arrays are currently not implemented due to a Swift compiler bug https://github.com/swiftlang/swift/issues/75994
 */
public enum AnyValue {
  case null
  case number(Double)
  case bool(Bool)
  case bigint(Int64)
  case string(String)
  case object(Dictionary<String, AnyValue>)

  static func create(_ value: margelo.nitro.AnyValue) -> AnyValue {
    if margelo.nitro.is_AnyValue_null(value) {
      return .null
    } else if margelo.nitro.is_AnyValue_bool(value) {
      return .bool(margelo.nitro.get_AnyValue_bool(value))
    } else if margelo.nitro.is_AnyValue_number(value) {
      return .number(margelo.nitro.get_AnyValue_number(value))
    } else if margelo.nitro.is_AnyValue_bigint(value) {
      return .bigint(margelo.nitro.get_AnyValue_bigint(value))
    } else if margelo.nitro.is_AnyValue_string(value) {
      return .string(margelo.nitro.get_AnyValue_string(value).toSwift())
    } else if margelo.nitro.is_AnyValue_AnyObject(value) {
      return .object(margelo.nitro.get_AnyValue_AnyObject(value).toSwift())
    } else {
      fatalError("AnyValue has unknown type!")
    }
  }
}

/**
 * Represents an `AnyMap` that can be passed to Swift.
 */
public class AnyMapHolder {
  let _cppPart: margelo.nitro.TSharedMap

  public init() {
    _cppPart = margelo.nitro.AnyMap.make()
  }

  public init(withPreallocatedSize size: Int) {
    _cppPart = margelo.nitro.AnyMap.make(size)
  }

  // pragma MARK: Common Operations

  /**
   * Returns whether the given key exists in the map.
   */
  public func contains(key: String) -> Bool {
    return _cppPart.pointee.contains(std.string(key))
  }

  /**
   * Removes the given key from the map.
   */
  public func remove(key: String) {
    _cppPart.pointee.remove(std.string(key))
  }

  /**
   * Removes all keys in this map.
   */
  public func clear() {
    _cppPart.pointee.clear()
  }

  // pragma MARK: Getters

  /**
   * Gets the double value at the given key.
   * If no value exists at the given key, or if it is not a double,
   * this function throws.
   */
  public func getDouble(key: String) -> Double {
    return _cppPart.pointee.getDouble(std.string(key))
  }

  /**
   * Gets the double value at the given key.
   * If no value exists at the given key, or if it is not a double,
   * this function throws.
   */
  public func getBoolean(key: String) -> Bool {
    return _cppPart.pointee.getBoolean(std.string(key))
  }

  /**
   * Gets the double value at the given key.
   * If no value exists at the given key, or if it is not a double,
   * this function throws.
   */
  public func getBigInt(key: String) -> Int64 {
    return _cppPart.pointee.getBigInt(std.string(key))
  }

  /**
   * Gets the double value at the given key.
   * If no value exists at the given key, or if it is not a double,
   * this function throws.
   */
  public func getString(key: String) -> String {
    let value = _cppPart.pointee.getString(std.string(key))
    return String(value)
  }

  /**
   * Gets the double value at the given key.
   * If no value exists at the given key, or if it is not a double,
   * this function throws.
   */
  public func getObject(key: String) -> Dictionary<String, AnyValue> {
    let value = _cppPart.pointee.getObject(std.string(key))
    return value.toSwift()
  }

  // pragma MARK: Setters

  /**
   * Set the given key to `null`.
   */
  public func setNull(key: String) {
    _cppPart.pointee.setNull(std.string(key))
  }

  /**
   * Set the given key to the given double value.
   */
  public func setDouble(key: String, value: Double) {
    _cppPart.pointee.setDouble(std.string(key), value)
  }

  /**
   * Set the given key to the given boolean value.
   */
  public func setBoolean(key: String, value: Bool) {
    _cppPart.pointee.setBoolean(std.string(key), value)
  }

  /**
   * Set the given key to the given bigint value.
   */
  public func setBigInt(key: String, value: Int64) {
    _cppPart.pointee.setBigInt(std.string(key), value)
  }

  /**
   * Set the given key to the given string value.
   */
  public func setString(key: String, value: String) {
    _cppPart.pointee.setString(std.string(key), std.string(value))
  }

  /**
   * Set the given key to the given object value.
   */
  public func setObject(key: String, value: Dictionary<String, AnyValue>) {
    _cppPart.pointee.setObject(std.string(key), margelo.nitro.AnyObject.create(value))
  }

  // pragma MARK: Is Getters

  /**
   * Gets whether the given `key` is holding a null value, or not.
   */
  public func isNull(key: String) -> Bool {
    return _cppPart.pointee.isNull(std.string(key))
  }

  /**
   * Gets whether the given `key` is holding a double value, or not.
   */
  public func isDouble(key: String) -> Bool {
    return _cppPart.pointee.isDouble(std.string(key))
  }

  /**
   * Gets whether the given `key` is holding a boolean value, or not.
   */
  public func isBool(key: String) -> Bool {
    return _cppPart.pointee.isBoolean(std.string(key))
  }

  /**
   * Gets whether the given `key` is holding a bigint value, or not.
   */
  public func isBigInt(key: String) -> Bool {
    return _cppPart.pointee.isBigInt(std.string(key))
  }

  /**
   * Gets whether the given `key` is holding a string value, or not.
   */
  public func isString(key: String) -> Bool {
    return _cppPart.pointee.isString(std.string(key))
  }

  /**
   * Gets whether the given `key` is holding a object value, or not.
   */
  public func isObject(key: String) -> Bool {
    return _cppPart.pointee.isObject(std.string(key))
  }
}

// pragma MARK: margelo.nitro.AnyValue extension

extension margelo.nitro.AnyValue {
  static func create(_ value: AnyValue) -> margelo.nitro.AnyValue {
    switch value {
    case .null:
      return create()
    case .bool(let bool):
      return create(bool)
    case .number(let number):
      return create(number)
    case .bigint(let bigint):
      return create(bigint)
    case .string(let string):
      return create(string)
    case .object(let object):
      return create(object)
    }
  }
  static func create() -> margelo.nitro.AnyValue {
    return margelo.nitro.create_AnyValue()
  }
  static func create(_ value: Bool) -> margelo.nitro.AnyValue {
    return margelo.nitro.create_AnyValue(value)
  }
  static func create(_ value: Double) -> margelo.nitro.AnyValue {
    return margelo.nitro.create_AnyValue(value)
  }
  static func create(_ value: Int64) -> margelo.nitro.AnyValue {
    return margelo.nitro.create_AnyValue(value)
  }
  static func create(_ value: String) -> margelo.nitro.AnyValue {
    return margelo.nitro.create_AnyValue(std.string(value))
  }
  static func create(_ value: [AnyValue]) -> margelo.nitro.AnyValue {
    return margelo.nitro.create_AnyValue(margelo.nitro.AnyArray.create(value))
  }
  static func create(_ value: Dictionary<String, AnyValue>) -> margelo.nitro.AnyValue {
    return margelo.nitro.create_AnyValue(margelo.nitro.AnyObject.create(value))
  }
}

// pragma MARK: std.string extension

extension std.string {
  func toSwift() -> String {
    return String(self)
  }
}

// pragma MARK: margelo.nitro.AnyArray extension

extension margelo.nitro.AnyArray {
  static func create(_ array: [AnyValue]) -> margelo.nitro.AnyArray {
    var vector = margelo.nitro.AnyArray()
    vector.reserve(array.count)
    for value in array {
      vector.push_back(margelo.nitro.AnyValue.create(value))
    }
    return vector
  }

  func toSwift() -> [AnyValue] {
    var array: [AnyValue] = []
    array.reserveCapacity(self.size())
    for value in self {
      array.append(AnyValue.create(value))
    }
    return array
  }
}

// pragma MARK: margelo.nitro.AnyObject extension

extension margelo.nitro.AnyObject {
  static func create(_ dictionary: Dictionary<String, AnyValue>) -> margelo.nitro.AnyObject {
    var object = margelo.nitro.AnyObject()
    object.reserve(dictionary.count)
    for (key, value) in dictionary {
      object[std.string(key)] = margelo.nitro.AnyValue.create(value)
    }
    return object
  }

  func toSwift() -> Dictionary<String, AnyValue> {
    let keys = margelo.nitro.getAnyObjectKeys(self)
    var dictionary = Dictionary<String, AnyValue>(minimumCapacity: keys.size())
    for key in keys {

    }
    return dictionary
  }
}
