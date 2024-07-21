//
//  ValueOrError.swift
//  NitroModules
//
//  Created by Marc Rousavy on 22.07.24.
//

import Foundation

/**
 * Represents either a value, or an error.
 * This is used to convert exceptions into return types.
 */
public enum ValueOrError<T> {
  case value(T)
  case error(message: String)
}
