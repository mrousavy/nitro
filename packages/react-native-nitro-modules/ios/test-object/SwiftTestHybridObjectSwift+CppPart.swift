//
//  SwiftTestHybridObjectSwift+CppPart.swift
//  NitroModules
//
//  Created by Marc Rousavy on 16.07.24.
//

import Foundation

extension SwiftTestHybridObjectSwift {
  static var swiftToCppMap: [UnsafeMutableRawPointer: margelo.SwiftTestHybridObject] = [:]
  
  var cppPart: margelo.SwiftTestHybridObject? {
    get {
      let address = Unmanaged.passUnretained(self).toOpaque()
      if let cppPart = SwiftTestHybridObjectSwift.swiftToCppMap[address] {
        return cppPart
      }
      let cppPart = margelo.SwiftTestHybridObject(self)
      SwiftTestHybridObjectSwift.swiftToCppMap[address] = cppPart
      return cppPart
    }
  }
}
