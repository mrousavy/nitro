//
//  AnyMap.swift
//  NitroModules
//
//  Created by Marc Rousavy on 20.08.24.
//

import Foundation

/// Represents any value representable by the `AnyMap`.
/// Note: Arrays are currently not implemented due to a Swift compiler bug https://github.com/swiftlang/swift/issues/75994
public indirect enum AnyValue {
  case null
  case number(Double)
  case bool(Bool)
  case bigint(Int64)
  case string(String)
  case array([AnyValue])
  case object([String: AnyValue])

  static func create(_ value: margelo.nitro.AnyValue) -> AnyValue {
    if margelo.nitro.AnyMapUtils.is_AnyValue_null(value) {
      return .null
    } else if margelo.nitro.AnyMapUtils.is_AnyValue_bool(value) {
      return .bool(margelo.nitro.AnyMapUtils.get_AnyValue_bool(value))
    } else if margelo.nitro.AnyMapUtils.is_AnyValue_number(value) {
      return .number(margelo.nitro.AnyMapUtils.get_AnyValue_number(value))
    } else if margelo.nitro.AnyMapUtils.is_AnyValue_bigint(value) {
      return .bigint(margelo.nitro.AnyMapUtils.get_AnyValue_bigint(value))
    } else if margelo.nitro.AnyMapUtils.is_AnyValue_string(value) {
      return .string(String(margelo.nitro.AnyMapUtils.get_AnyValue_string(value)))
    } else if margelo.nitro.AnyMapUtils.is_AnyValue_AnyArray(value) {
      return .array(margelo.nitro.AnyMapUtils.get_AnyValue_AnyArray(value).toSwift())
    } else if margelo.nitro.AnyMapUtils.is_AnyValue_AnyObject(value) {
      return .object(margelo.nitro.AnyMapUtils.get_AnyValue_AnyObject(value).toSwift())
    } else {
      fatalError("AnyValue has unknown type!")
    }
  }
}

/// Represents an `AnyMap`- an untyped map instance.
/// See C++ `AnyMap.hpp` for more information.
public final class AnyMap: @unchecked Sendable {
  private var dictionary: Dictionary<String, Any>
  
  public init() {
    dictionary = Dictionary()
  }
  public init(withPreallocatedSize size: Int) {
    dictionary = Dictionary(minimumCapacity: size)
  }
  
  /**
   * Get the count of items stored in this `AnyMap`.
   */
  public var count: Int {
    return dictionary.count
  }

  // pragma MARK: Common Operations

  /**
   * Returns whether the given key exists in the map.
   */
  public func contains(key: String) -> Bool {
    return dictionary[key] != nil
  }

  /**
   * Removes the given key from the map.
   */
  public func remove(key: String) {
    dictionary.removeValue(forKey: key)
  }

  /**
   * Removes all keys in this map.
   */
  public func clear() {
    dictionary = [:]
  }

  /**
   * Get all keys in this map.
   */
  public func getAllKeys() -> [String] {
    return Array(dictionary.keys)
  }

  // pragma MARK: Getters

  public func getDoubleOrNil(key: String) -> Double? {
    return dictionary[key] as? Double
  }
  public func getDouble(key: String) throws -> Double {
    guard let value = getDoubleOrNil(key: key) else {
      throw RuntimeError.error(withMessage: "AnyMap does not contain a Double with key \"\(key)\"!")
    }
    return value
  }

  public func getBooleanOrNil(key: String) -> Bool? {
    return dictionary[key] as? Bool
  }
  public func getBoolean(key: String) throws -> Bool {
    guard let value = getBooleanOrNil(key: key) else {
      throw RuntimeError.error(withMessage: "AnyMap does not contain a Boolean with key \"\(key)\"!")
    }
    return value
  }

  public func getBigIntOrNil(key: String) -> Int64? {
    return dictionary[key] as? Int64
  }
  public func getBigInt(key: String) throws -> Int64 {
    guard let value = getBigIntOrNil(key: key) else {
      throw RuntimeError.error(withMessage: "AnyMap does not contain a BigInt with key \"\(key)\"!")
    }
    return value
  }

  public func getStringOrNil(key: String) -> String? {
    return dictionary[key] as? String
  }
  public func getString(key: String) throws -> String {
    guard let value = getStringOrNil(key: key) else {
      throw RuntimeError.error(withMessage: "AnyMap does not contain a String with key \"\(key)\"!")
    }
    return value
  }

  public func getArrayOrNil(key: String) -> [AnyValue]? {
    return dictionary[key] as? [AnyValue]
  }
  public func getArray(key: String) throws -> [AnyValue]? {
    guard let value = getArrayOrNil(key: key) else {
      throw RuntimeError.error(withMessage: "AnyMap does not contain an Array with key \"\(key)\"!")
    }
    return value
  }

  public func getObjectOrNil(key: String) -> [String: AnyValue]? {
    return dictionary[key] as? [String: AnyValue]
  }
  public func getObject(key: String) throws -> [String: AnyValue] {
    guard let value = getObjectOrNil(key: key) else {
      throw RuntimeError.error(withMessage: "AnyMap does not contain an Object with key \"\(key)\"!")
    }
    return value
  }

  /**
   * Gets the value value at the given key.
   * If no value exists at the given key,
   * this function throws.
   */
  public func getAny(key: String) -> Any? {
    return dictionary[key]
  }

  // pragma MARK: Setters

  /**
   * Set the given key to `null`.
   */
  public func setNull(key: String) {
    dictionary[key] = nil
  }

  /**
   * Set the given key to the given double value.
   */
  public func setDouble(key: String, value: Double) {
    dictionary[key] = value
  }

  /**
   * Set the given key to the given boolean value.
   */
  public func setBoolean(key: String, value: Bool) {
    dictionary[key] = value
  }

  /**
   * Set the given key to the given bigint value.
   */
  public func setBigInt(key: String, value: Int64) {
    dictionary[key] = value
  }

  /**
   * Set the given key to the given string value.
   */
  public func setString(key: String, value: String) {
    dictionary[key] = value
  }

  /**
   * Set the given key to the given array value.
   */
  public func setArray(key: String, value: [AnyValue]) {
    dictionary[key] = value
  }

  /**
   * Set the given key to the given object value.
   */
  public func setObject(key: String, value: [String: AnyValue]) {
    dictionary[key] = value
  }

  /**
   * Set the given key to the given any value.
   */
  public func setAny(key: String, value: Any?) {
    dictionary[key] = value
  }

  // pragma MARK: Is Getters

  /**
   * Gets whether the given `key` is holding a null value, or not.
   */
  public func isNull(key: String) -> Bool {
    return dictionary[key] == nil
  }

  /**
   * Gets whether the given `key` is holding a double value, or not.
   */
  public func isDouble(key: String) -> Bool {
    return dictionary[key] is Double
  }

  /**
   * Gets whether the given `key` is holding a boolean value, or not.
   */
  public func isBool(key: String) -> Bool {
    return dictionary[key] is Bool
  }

  /**
   * Gets whether the given `key` is holding a bigint value, or not.
   */
  public func isBigInt(key: String) -> Bool {
    return dictionary[key] is Int64
  }

  /**
   * Gets whether the given `key` is holding a string value, or not.
   */
  public func isString(key: String) -> Bool {
    return dictionary[key] is String
  }

  /**
   * Gets whether the given `key` is holding an array value, or not.
   */
  public func isArray(key: String) -> Bool {
    return dictionary[key] is Array<Any?>
  }

  /**
   * Gets whether the given `key` is holding an object value, or not.
   */
  public func isObject(key: String) -> Bool {
    return dictionary[key] is Dictionary<String, Any>
  }

  /**
   * Merges all keys and values from the `other` map into this map.
   */
  public func merge(other: AnyMap) {
    fatalError("not yet implemented!")
  }
}

// pragma MARK: margelo.nitro.AnyValue extension

extension margelo.nitro.AnyValue {
  static func create(_ value: AnyValue) -> margelo.nitro.AnyValue {
    switch value {
    case .null:
      return create(NullType.null)
    case .bool(let bool):
      return create(bool)
    case .number(let number):
      return create(number)
    case .bigint(let bigint):
      return create(bigint)
    case .string(let string):
      return create(string)
    case .array(let array):
      return create(array)
    case .object(let object):
      return create(object)
    }
  }
  static func create(_ null: NullType) -> margelo.nitro.AnyValue {
    return margelo.nitro.AnyMapUtils.create_AnyValue(margelo.nitro.NullType.null)
  }
  static func create(_ value: Bool) -> margelo.nitro.AnyValue {
    return margelo.nitro.AnyMapUtils.create_AnyValue(value)
  }
  static func create(_ value: Double) -> margelo.nitro.AnyValue {
    return margelo.nitro.AnyMapUtils.create_AnyValue(value)
  }
  static func create(_ value: Int64) -> margelo.nitro.AnyValue {
    return margelo.nitro.AnyMapUtils.create_AnyValue(value)
  }
  static func create(_ value: String) -> margelo.nitro.AnyValue {
    return margelo.nitro.AnyMapUtils.create_AnyValue(std.string(value))
  }
  static func create(_ value: [AnyValue]) -> margelo.nitro.AnyValue {
    return margelo.nitro.AnyMapUtils.create_AnyValue(margelo.nitro.AnyArray.create(value))
  }
  static func create(_ value: [String: AnyValue]) -> margelo.nitro.AnyValue {
    return margelo.nitro.AnyMapUtils.create_AnyValue(margelo.nitro.AnyObject.create(value))
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
  static func create(_ dictionary: [String: AnyValue]) -> margelo.nitro.AnyObject {
    var object = margelo.nitro.AnyObject()
    object.reserve(dictionary.count)
    for (key, value) in dictionary {
      object[std.string(key)] = margelo.nitro.AnyValue.create(value)
    }
    return object
  }

  func toSwift() -> [String: AnyValue] {
    let keys = margelo.nitro.AnyMapUtils.getAnyObjectKeys(self)
    var dictionary = [String: AnyValue](minimumCapacity: keys.size())
    for key in keys {
      let value = margelo.nitro.AnyMapUtils.getAnyObjectValue(self, key)
      dictionary[String(key)] = AnyValue.create(value)
    }
    return dictionary
  }
}

// pragma MARK: AnyValue <-> Any extension

extension AnyValue {
  public static func fromAny(_ any: Any?) throws -> AnyValue {
    switch any {
    case nil:
      return AnyValue.null
    case let value as String:
      return AnyValue.string(value)
    case let value as Double:
      return AnyValue.number(value)
    case let value as Int:
      return AnyValue.number(Double(value))
    case let value as Float:
      return AnyValue.number(Double(value))
    case let value as Int64:
      return AnyValue.bigint(value)
    case let value as Bool:
      return AnyValue.bool(value)
    case let value as [Any]:
      let array = try value.map { try AnyValue.fromAny($0) }
      return AnyValue.array(array)
    case let value as [String: Any]:
      let map = try value.mapValues { try AnyValue.fromAny($0) }
      return AnyValue.object(map)
    case is AnyValue, is AnyMap, is margelo.nitro.AnyValue, is margelo.nitro.AnyArray,
      is margelo.nitro.AnyObject:
      throw RuntimeError.error(
        withMessage: "Cannot box AnyValue (\(String(describing: any))) twice!")
    default:
      throw RuntimeError.error(
        withMessage: "Value \(String(describing: any)) cannot be represented as AnyValue!")
    }
  }

  public func toAny() -> Any? {
    switch self {
    case .null:
      return nil
    case .bigint(let int):
      return int
    case .bool(let bool):
      return bool
    case .number(let double):
      return double
    case .array(let array):
      return array.map { $0.toAny() }
    case .object(let object):
      return object.mapValues { $0.toAny() }
    case .string(let string):
      return string
    }
  }
}

// pragma MARK: AnyMap <-> Any extension

extension AnyMap {
  /**
  * Convert the given `Dictionary<String, Any?>` to an `AnyMap`
  * by copying all keys and values into the C++ container.
  * If a key cannot be wrapped as any, this will throw.
  */
  public static func fromDictionary(_ dictionary: [String: Any?]) throws -> AnyMap {
    let map = AnyMap(withPreallocatedSize: dictionary.count)
    for (key, value) in dictionary {
      try map.setAny(key: key, value: value)
    }
    return map
  }
  /**
  * Convert the given `Dictionary<String, Any?>` to an `AnyMap`
  * by copying all keys and values into the C++ container.
  * If a key cannot be wrapped as any, it will simply be ignored and omitted.
  */
  public static func fromDictionaryIgnoreIncompatible(_ dictionary: [String: Any?]) -> AnyMap {
    let map = AnyMap(withPreallocatedSize: dictionary.count)
    for (key, value) in dictionary {
      try? map.setAny(key: key, value: value)
    }
    return map
  }

  /**
  * Convert this `AnyMap` instance to a `Dictionary<String, Any?>`
  * by copying all keys and values into a wrapped Swift container.
  */
  public func toDictionary() -> [String: Any?] {
    var dictionary: [String: Any?] = [:]
    let keys = self.getAllKeys()
    dictionary.reserveCapacity(keys.count)
    for key in keys {
      dictionary[key] = self.getAny(key: key)
    }
    return dictionary
  }
}

@available(*, deprecated, renamed: "AnyMap")
public typealias AnyMapHolder = AnyMap
