//
//  SomeExternalObjectSubclass.swift
//  react-native-nitro-test
//
//  Created by Marc Rousavy on 30.10.25.
//

import Foundation

class HybridSomeExternalObjectSubclass: HybridSomeExternalObjectSubclassSpec {
  func getValue() throws -> String {
    return "overridden!"
  }

  func getSubclassedValue() -> String {
    return "subclassed!"
  }
}
