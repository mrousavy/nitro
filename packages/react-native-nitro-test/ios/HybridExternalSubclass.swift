//
//  HybridExternalSubclass.swift
//  NitroTest
//
//  Created by Marc Rousavy on 11.08.24.
//

import Foundation
import NitroModules
import NitroTestExternal

class HybridExternalSubclass: HybridExternalSubclassSpec {
  func getValue() throws -> String {
    return "This is overridden!"
  }
  func getSubclassValue() throws -> String {
    return "subclassed!"
  }
}
