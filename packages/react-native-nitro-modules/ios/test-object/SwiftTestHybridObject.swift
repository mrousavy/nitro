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
  public func throwError() throws {
    throw SomeError.error
  }
  
  public var hybridContext = margelo.HybridContext()
  
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
