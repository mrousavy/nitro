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
  func bounceEnum(value: SomeExternalEnum) throws -> SomeExternalEnum {
    return value
  }

  func bounceStruct(value: SomeExternalStruct) throws -> SomeExternalStruct {
    return value
  }

  func getValue() throws -> String {
    return "This is overridden!"
  }
}
