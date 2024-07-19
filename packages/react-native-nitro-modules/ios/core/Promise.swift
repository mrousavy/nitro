//
//  Promise.swift
//  NitroModules
//
//  Created by Marc Rousavy on 19.07.24.
//

import Foundation

/**
 * Represents a JS Promise.
 *
 * At the moment, this does nothing.
 */
public class Promise<T> {
  
  public static func resolved() -> Promise<T> {
    return Promise<T>()
  }
}
