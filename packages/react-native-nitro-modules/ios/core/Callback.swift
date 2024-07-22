//
//  Callback.swift
//  NitroModules
//
//  Created by Marc Rousavy on 22.07.24.
//

import Foundation
import CxxStdlib

class Something {
  func test(x: margelo.nitro.AnotherTwo) {
    x(55)
  }
  
  func okMaybe(ffff: (String) -> Int) {
    let ok = ffff("THEE")
  }
}
