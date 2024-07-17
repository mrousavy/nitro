//
//  SwiftTestHybridObjectSwift.swift
//  NitroModules
//
//  Created by Marc Rousavy on 23.06.24.
//

import Foundation

public enum SomeError: Error {
  case error
}

// Implemented by the user
public class SwiftTestHybridObject: SwiftTestHybridObjectSpec {
  public var hybridContext = margelo.HybridContext()
  
  public func asyncMethod() async -> Double {
    return 5.0
  }
  
  public func throwError() throws -> Int {
    throw SomeError.error
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

public enum ValueOrError1 {
  case value(Int)
  case error(String)
}

public class SwiftTestHybridObjectSpecHelpers {
  public static func throwErrorCxx(instance: SwiftTestHybridObject) -> ValueOrError1 {
    do {
      let result = try instance.throwError()
      return .value(result)
    } catch (let error) {
      // TODO: Swift bug - `localizedDescription` is memory owned by `Error` - this will freeze the app. So we create a copy using string interoplation.
      let message = "\(error.localizedDescription)"
      return .error(message)
    }
  }
}
