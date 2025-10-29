//
//  HybridSomeExternalObjectSubclass.swift
//  NitroTest
//
//  Created by Marc Rousavy on 11.08.24.
//

import Foundation
import NitroModules
import NitroTestExternal

class HybridSomeExternalObjectSubclass: HybridSomeExternalObjectSubclassSpec {
  func getValue() throws -> String {
    return "subclass!"
  }

  func bounceEnum(value: SomeExternalEnum) -> SomeExternalEnum {
    return value
  }

  func bounceStruct(value: SomeExternalStruct) -> SomeExternalStruct {
    return value
  }

  var isSubclass: Bool {
    return true
  }
}
