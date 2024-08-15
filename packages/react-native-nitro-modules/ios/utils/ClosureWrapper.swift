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
 *
 * To create a `ClosureWrapper`, use `ClosureWrapper.wrap(...)`.
 */
public final class ClosureWrapper {
  private let closure: () -> Void

  private init(closure: @escaping () -> Void) {
    self.closure = closure
  }

  private func invoke() {
    closure()
  }
  
  /**
   * Wraps the given Swift closure in a C-style function pointer with `void* context` associated to it.
   * This way it can be passed to C/C++ and called without worrying about context/binding.
   */
  public static func wrap(closure: @escaping () -> Void) -> (@convention(c) (UnsafeMutableRawPointer?) -> Void, UnsafeMutableRawPointer) {
    // Wrap closure in void*
    let context = Unmanaged.passRetained(ClosureWrapper(closure: closure)).toOpaque()
    // Create C-style Function Pointer
    let cFunc: @convention(c) (UnsafeMutableRawPointer?) -> Void = { context in
      guard let context else { fatalError("Context was null, even though we created one!") }
      // Unwrap context from void* to closure again
      let closure = Unmanaged<ClosureWrapper>.fromOpaque(context).takeRetainedValue()
      // Call it!
      closure.invoke()
    }
    return (cFunc, context)
  }
}
