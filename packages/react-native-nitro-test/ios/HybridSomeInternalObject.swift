//
//  HybridTestObjectSwift.swift
//  NitroTest
//
//  Created by Marc Rousavy on 11.08.24.
//

import Foundation
import NitroModules
import NitroTestExternal

class HybridSomeInternalObject: HybridSomeExternalObjectSpec {
    
  func getValue() throws -> String {
    return "This is overridden!"
  }
  
  func getNumber() throws -> SomeExternalObjectNumber {
    return  SomeExternalObjectNumber(
        number: 20
    )
  }
}
