//
//  SwiftTestHybridObjectSwift.swift
//  NitroModules
//
//  Created by Marc Rousavy on 23.06.24.
//

import Foundation

public class TestHybridObject {
  var hybridContext = margelo.HybridContext()
  
  var int: Int {
    get {
      margelo.throwCppError("TestHybridObject.int (getter) needs to be overridden!")
      fatalError("TestHybridObject.int (getter) needs to be overridden!")
    }
    set {
      margelo.throwCppError("TestHybridObject.int (setter) needs to be overridden!")
      fatalError("TestHybridObject.int (setter) needs to be overridden!")
    }
  }
}

public class SwiftTestHybridObjectSwift: TestHybridObject {
  private var _int: Int = 5
  
  public var doooo: Double {
    return 4.0
  }
  
  public override init() {
    print("Initialized a new SwiftTestHybridObjectSwift!")
  }
}
