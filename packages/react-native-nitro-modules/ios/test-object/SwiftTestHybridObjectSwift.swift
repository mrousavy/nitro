//
//  SwiftTestHybridObjectSwift.swift
//  NitroModules
//
//  Created by Marc Rousavy on 23.06.24.
//

import Foundation

public class SwiftTestHybridObjectSwift {
  // Internal C++ state
  public var hybridContext: margelo.HybridContext? = nil
  
  private var _int: Int = 5
  public var int: Int {
    get {
      print("getting \(_int)")
      return _int
    }
    set {
      print("setting \(_int) to \(newValue)..")
      _int = newValue
    }
  }
  
  public var doooo: Double {
    return 4.0
  }
  
  public init() {
    print("Initialized a new SwiftTestHybridObjectSwift!")
  }
}
