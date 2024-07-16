//
//  SwiftTestHybridObject.swift
//  NitroModules
//
//  Created by Marc Rousavy on 23.06.24.
//

import Foundation

public class SwiftTestHybridObjectSwift {
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
  }
}
