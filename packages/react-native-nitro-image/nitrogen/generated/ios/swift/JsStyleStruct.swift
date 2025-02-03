///
/// JsStyleStruct.swift
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

import NitroModules

/**
 * Represents an instance of `JsStyleStruct`, backed by a C++ struct.
 */
public typealias JsStyleStruct = margelo.nitro.image.JsStyleStruct

public extension JsStyleStruct {
  private typealias bridge = margelo.nitro.image.bridge.swift

  /**
   * Create a new instance of `JsStyleStruct`.
   */
  init(value: Double, onChanged: @escaping (_ num: Double) -> Void, someMap: Dictionary<String, String>) {
    self.init(value, { () -> bridge.Func_void_double in
      let __closureWrapper = Func_void_double(onChanged)
      return bridge.create_Func_void_double(__closureWrapper.toUnsafe())
    }(), { () -> bridge.std__unordered_map_std__string__std__string_ in
      var __map = bridge.create_std__unordered_map_std__string__std__string_(someMap.count)
      for (__k, __v) in someMap {
        __map[std.string(__k)] = std.string(__v)
      }
      return __map
    }())
  }

  var value: Double {
    @inline(__always)
    get {
      return self.__value
    }
    @inline(__always)
    set {
      self.__value = newValue
    }
  }
  
  var onChanged: (_ num: Double) -> Void {
    @inline(__always)
    get {
      return { () -> (Double) -> Void in
        let __wrappedFunction = bridge.wrap_Func_void_double(self.__onChanged)
        return { (__num: Double) -> Void in
          __wrappedFunction.call(__num)
        }
      }()
    }
    @inline(__always)
    set {
      self.__onChanged = { () -> bridge.Func_void_double in
        let __closureWrapper = Func_void_double(newValue)
        return bridge.create_Func_void_double(__closureWrapper.toUnsafe())
      }()
    }
  }
  
  var someMap: Dictionary<String, String> {
    @inline(__always)
    get {
      return { () -> Dictionary<String, String> in
        var __dictionary = Dictionary<String, String>(minimumCapacity: self.__someMap.size())
        let __keys = bridge.get_std__unordered_map_std__string__std__string__keys(self.__someMap)
        for __key in __keys {
          let __value = self.__someMap[__key]!
          __dictionary[String(__key)] = String(__value)
        }
        return __dictionary
      }()
    }
    @inline(__always)
    set {
      self.__someMap = { () -> bridge.std__unordered_map_std__string__std__string_ in
        var __map = bridge.create_std__unordered_map_std__string__std__string_(newValue.count)
        for (__k, __v) in newValue {
          __map[std.string(__k)] = std.string(__v)
        }
        return __map
      }()
    }
  }
}
