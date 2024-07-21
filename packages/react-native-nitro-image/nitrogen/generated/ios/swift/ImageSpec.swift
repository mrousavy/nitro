///
/// ImageSpec.swift
/// Sun Jul 21 2024
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/react-native-nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

import Foundation
import NitroModules

/**
 * A Swift protocol representing the Image HybridObject.
 * Implement this protocol to create Swift-based instances of Image.
 *
 * When implementing this protocol, make sure to initialize `hybridContext` - example:
 * ```
 * public class Image : ImageSpec {
 *   // Initialize HybridContext
 *   var hybridContext = margelo.nitro.HybridContext()
 *
 *   // ...
 * }
 * ```
 */
public protocol ImageSpec {
  // Nitro Modules Hybrid Context
  var hybridContext: margelo.nitro.HybridContext { get set }

  // Properties
  var size: ImageSize { get }
  var pixelFormat: PixelFormat { get }

  // Methods
  func toArrayBuffer(format: ImageFormat) throws -> Data
  func saveToFile(path: String) throws -> Promise<Void>
}