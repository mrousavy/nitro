//
//  SwiftTestHybridObjectSwift.swift
//  NitroModules
//
//  Created by Marc Rousavy on 23.06.24.
//

import Foundation

// Implemented by the user
public class SwiftTestHybridObject: SwiftTestHybridObjectSpec {
  public var hybridContext = margelo.nitro.HybridContext()
  
  public func asyncMethod() async -> Double {
    return 5.0
  }
  
  public func throwError() throws -> Int {
    throw RuntimeError.error(withMessage: "This is a Swift error!")
  }
  
  private var _int: Int = 5
  public var int: Int {
    get {
      return _int
    }
    set {
      _int = newValue
    }
  }
  
  public init() {
    print("Initialized a new SwiftTestHybridObject!")
  }
}

// TODO: Avoid generating associated enums for each type once Swift fixes generic enums!
public enum ValueOrError1 {
  case value(Int)
  case error(String)
}

public class SwiftTestHybridObjectSpecHelpers {
  public static func throwErrorCxx(instance: SwiftTestHybridObject) -> ValueOrError1 {
    do {
      let result = try instance.throwError()
      return .value(result)
    } catch RuntimeError.error(let message) {
      return .error(message)
    } catch {
      // TODO: Swift bug - `localizedDescription` is memory owned by `Error` - this will freeze the app. So we create a copy using string interoplation.
      let message = "\(error.localizedDescription)"
      return .error(message)
    }
  }
}
