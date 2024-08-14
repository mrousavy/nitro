//
//  ClosureWrapper.swift
//  NitroModules
//
//  Created by Marc Rousavy on 14.08.24.
//

import Foundation

/**
 * Wraps a closure in a Swift class.
 * This can be used to create unmanaged pointers (`void*`) and
 * passed to C-style function pointers via `void* context` parameters.
 */
final class ClosureWrapper {
  let closure: () -> Void
  
  init(closure: @escaping () -> Void) {
    self.closure = closure
  }
  
  func invoke() {
    closure()
  }
}
