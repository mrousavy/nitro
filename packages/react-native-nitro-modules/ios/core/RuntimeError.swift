//
//  RuntimeError.swift
//  NitroModules
//
//  Created by Marc Rousavy on 17.07.24.
//

import Foundation

/// Represents an error that occured at any point during the application's runtime.
///
/// Throw this error in Nitro Modules to provide clear and concise error messages to JS.
@frozen
public enum RuntimeError: Error, CustomStringConvertible {
  case error(
    message: String,
    stacktrace: String)

  @available(*, deprecated, renamed: "RuntimeError()")
  public static func error(withMessage message: String) -> RuntimeError {
    return RuntimeError(message)
  }

  public init(_ message: String) {
    let stack = Thread.callStackSymbols
    self = .error(
      message: message,
      stacktrace: stack.joined(separator: "\n"))
  }

  public var description: String {
    switch self {
    case .error(let message, _): return message
    }
  }

  /**
   * Creates a new `RuntimeError` from the given C++ `std::exception`.
   */
  public static func from(cppError: std.exception_ptr) -> RuntimeError {
    let message = margelo.nitro.getExceptionMessage(cppError)
    let stacktrace = margelo.nitro.getExceptionStacktrace(cppError)
    return RuntimeError.error(
      message: String(message),
      stacktrace: String(stacktrace))
  }
}

extension Error {
  /**
   * Converts this `Error` to a C++ `std::exception`.
   */
  public func toCpp() -> std.exception_ptr {

    if let self = self as? RuntimeError {
      if case RuntimeError.error(let message, let stacktrace) = self {
        // We have a message and a stacktrace:
        return margelo.nitro.makeException(std.string(message), std.string(stacktrace))
      }
    }

    // We don't have a stacktrace, just a message
    let message = String(describing: self)
    return margelo.nitro.makeException(std.string(message), "")
  }
}
