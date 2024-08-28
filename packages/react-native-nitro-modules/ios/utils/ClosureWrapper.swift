//
//  ClosureWrapper.swift
//  NitroModules
//
//  Created by Marc Rousavy on 14.08.24.
//

import Foundation

/**
 * Wraps a Swift closure in a Swift class.
 * This can be used to create unmanaged pointers (`void*`) and
 * passed to C-style function pointers via `void* context` parameters.
 */
public final class ClosureWrapper {
  private let closure: () -> Void
  
  init(closure: @escaping () -> Void) {
    self.closure = closure
  }
  
  func invoke() {
    closure()
  }
}

/**
 * Represents a Swift Closure that can be called from both C++ and Swift.
 */
public typealias SwiftClosure = margelo.nitro.SwiftClosure

extension SwiftClosure {
  /**
   * Create a new `SwiftClosure` wrapping the given Swift closure.
   * This can then be called from both C++ and Swift.
   */
  init(wrappingClosure closure: @escaping () -> Void) {
    // Wrap closure in void*, and increment it's ref count so it stays alive.
    let context = Unmanaged.passRetained(ClosureWrapper(closure: closure)).toOpaque()
    
    // Create a C-style Function Pointer, which calls the actual Swift closure.
    let call: @convention(c) (UnsafeMutableRawPointer?) -> Void = { context in
      guard let context else { fatalError("Context was null, even though we created one!") }
      // Unwrap context from void* to closure again. We are assuming that it has not been deleted yet.
      let closure = context.assumingMemoryBound(to: ClosureWrapper.self).pointee
      // Call it!
      closure.invoke()
    }
    
    // Create a C-style Function Pointer, which deletes the `ClosureWrapper`.
    let destroy: @convention(c) (UnsafeMutableRawPointer?) -> Void = { context in
      guard let context else { return }
      // Release the void* holding our `ClosureWrapper`
      Unmanaged<ClosureWrapper>.fromOpaque(context).release()
    }
    
    self.init(context, call, destroy)
  }
}
