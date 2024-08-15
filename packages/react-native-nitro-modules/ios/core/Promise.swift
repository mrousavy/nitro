//
//  Promise.swift
//  NitroModules
//
//  Created by Marc Rousavy on 15.08.24.
//

import Foundation

/**
 * Represents a Promise that can be passed to JS.
 */
public class Promise<T> {
  private enum State {
    case result(T)
    case error(Error)
  }
  
  private var state: State?
  private var onResolvedListeners: [(T) -> Void] = []
  private var onRejectedListeners: [(Error) -> Void] = []
  
  /**
   * Create a new pending Promise.
   * It can (and must) be resolved **or** rejected later.
   */
  public init() {
    state = nil
  }
  
  deinit {
    if state == nil {
      print("⚠️ Promise<\(String(describing: T.self))> got destroyed, but was never resolved or rejected! It is probably left hanging in JS now.")
    }
  }
  
  /**
   * Resolves this `Promise<T>` with the given `T` and notifies all listeners.
   */
  public func resolve(withResult result: T) {
    guard state == nil else {
      fatalError("Failed to resolve promise with \(result) - it has already been resolved or rejected!")
    }
    state = .result(result)
    onResolvedListeners.forEach { listener in listener(result) }
  }
  
  /**
   * Rejects this `Promise<T>` with the given `Error` and notifies all listeners.
   */
  public func reject(withError error: Error) {
    guard state == nil else {
      fatalError("Failed to reject promise with \(error) - it has already been resolved or rejected!")
    }
    state = .error(error)
    onRejectedListeners.forEach { listener in listener(error) }
  }
}

/**
 * Extensions to easily create new Promises.
 */
extension Promise {
  /**
   * Create a new `Promise<T>` already resolved with the given `T`.
   */
  public static func resolved(withResult result: T) -> Promise<T> {
    let promise = Promise()
    promise.state = .result(result)
    return promise
  }
  
  /**
   * Create a new `Promise<T>` already rejected with the given `Error`.
   */
  public static func rejected(withError error: Error) -> Promise<T> {
    let promise = Promise()
    promise.state = .error(error)
    return promise
  }
  
  /**
   * Create a new `Promise<T>` that runs the given `async` code in a `Task`.
   * This does not necessarily run the code in a different Thread, but supports Swift's `async`/`await`.
   */
  public static func `async`(_ priority: TaskPriority? = nil,
                             _ run: @escaping () async throws -> T) -> Promise<T> {
    let promise = Promise()
    Task(priority: priority) {
      do {
        let result = try await run()
        promise.resolve(withResult: result)
      } catch {
        promise.reject(withError: error)
      }
    }
    return promise
  }
  
  /**
   * Create a new `Promise<T>` that runs the given `run` function on a parallel Thread/`DispatchQueue`.
   */
  public static func parallel(_ queue: DispatchQueue = .global(),
                              _ run: @escaping () throws -> T) -> Promise<T> {
    let promise = Promise()
    queue.async {
      do {
        let result = try run()
        promise.resolve(withResult: result)
      } catch {
        promise.reject(withError: error)
      }
    }
    return promise
  }
}

/**
 * Extensions to support then/catch syntax.
 */
extension Promise {
  /**
   * Add a continuation listener to this `Promise<T>`.
   * Once the `Promise<T>` resolves, the `onResolvedListener` will be called.
   */
  public func then(_ onResolvedListener: @escaping (T) -> Void) {
    switch state {
    case .result(let result):
      onResolvedListener(result)
      break
    default:
      onResolvedListeners.append(onResolvedListener)
      break
    }
  }
  
  /**
   * Add an error continuation listener to this `Promise<T>`.
   * Once the `Promise<T>` rejects, the `onRejectedListener` will be called with the error.
   */
  public func `catch`(_ onRejectedListener: @escaping (Error) -> Void) {
    switch state {
    case .error(let error):
      onRejectedListener(error)
      break
    default:
      onRejectedListeners.append(onRejectedListener)
      break
    }
  }
}
