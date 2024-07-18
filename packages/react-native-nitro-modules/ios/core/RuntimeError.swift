//
//  RuntimeError.swift
//  NitroModules
//
//  Created by Marc Rousavy on 17.07.24.
//

import Foundation

/**
 * Represents an error that occured at any point during the application's runtime.
 *
 * Throw this error in Nitro Modules to provide clear and concise error messages to JS.
 */
public enum RuntimeError: Error {
  case error(withMessage: String)
}
