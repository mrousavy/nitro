//
//  ClosureWrapper.swift
//  NitroModules
//
//  Created by Marc Rousavy on 14.08.24.
//

import Foundation

class ClosureWrapper {
  let closure: () -> Void
  
  init(closure: @escaping () -> Void) {
    print("CLOSURE: initialized!")
    self.closure = closure
  }
  
  deinit {
    print("CLOSURE: deleted!")
  }
  
  func invoke() {
    print("CLOSURE: called!")
    closure()
  }
}
