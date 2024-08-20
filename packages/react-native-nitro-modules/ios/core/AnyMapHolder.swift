//
//  AnyMapHolder.swift
//  NitroModules
//
//  Created by Marc Rousavy on 20.08.24.
//

import Foundation

/**
 * Represents any value representable by the `AnyMap`.
 */
public enum AnyValue {
  case null
  case number(Double)
  case bool(Bool)
  case bigint(Int64)
  case string(String)
  case array([AnyValue])
  case object(Dictionary<String, AnyValue>)
}

/**
 * Represents an `AnyMap` that can be passed to Swift.
 */
public class AnyMapHolder {
  let _cppPart: margelo.nitro.TSharedMap
  
  init() {
    _cppPart = margelo.nitro.AnyMap.make()
  }
  
  init(withPreallocatedSize size: Int) {
    _cppPart = margelo.nitro.AnyMap.make(size)
  }
  
  /**
   * Returns whether the given key exists in the map.
   */
  func contains(key: String) -> Bool {
    return _cppPart.pointee.contains(std.string(key))
  }
  
  /**
   * Removes the given key from the map.
   */
  func remove(key: String) {
    _cppPart.pointee.remove(std.string(key))
  }
  
  /**
   * Removes all keys in this map.
   */
  func clear() {
    _cppPart.pointee.clear()
  }
  
  /**
   * Gets the double value at the given key.
   * If no value exists at the given key, or if it is not a double,
   * this function throws.
   */
  func getDouble(key: String) -> Double {
    return _cppPart.pointee.getDouble(std.string(key))
  }
  
  /**
   * Gets the double value at the given key.
   * If no value exists at the given key, or if it is not a double,
   * this function throws.
   */
  func getBoolean(key: String) -> Bool {
    return _cppPart.pointee.getBoolean(std.string(key))
  }
  
  /**
   * Gets the double value at the given key.
   * If no value exists at the given key, or if it is not a double,
   * this function throws.
   */
  func getBigInt(key: String) -> Int64 {
    return _cppPart.pointee.getBigInt(std.string(key))
  }
  
  /**
   * Gets the double value at the given key.
   * If no value exists at the given key, or if it is not a double,
   * this function throws.
   */
  func getString(key: String) -> String {
    let value = _cppPart.pointee.getString(std.string(key))
    return String(value)
  }
  
  /**
   * Gets the double value at the given key.
   * If no value exists at the given key, or if it is not a double,
   * this function throws.
   */
  func getArray(key: String) -> [AnyValue] {
    let value = _cppPart.pointee.getArray(std.string(key))
    return value.toSwift()
  }
  
  /**
   * Gets the double value at the given key.
   * If no value exists at the given key, or if it is not a double,
   * this function throws.
   */
  func getObject(key: String) -> Dictionary<String, AnyValue> {
    let value = _cppPart.pointee.getObject(std.string(key))
    return value.toSwift()
  }
}

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
    case .array(let array):
      return create(array)
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

extension std.string {
  func toSwift() -> String {
    return String(self)
  }
}

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
    }
    return array
  }
}

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
