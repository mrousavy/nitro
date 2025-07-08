//
//  HybridImage.swift
//  react-native-nitro-test
//
//  Created by Marc Rousavy on 18.07.24.
//

import Foundation
import UIKit
import NitroModules

/**
 * Implement `HybridImageSpec` so we can expose this Swift class to JS.
 */
class HybridImage : HybridImageSpec {
  /**
   * Alias the namespace so we don't have to write it out each time.
   */
  typealias native = margelo.nitro.test
  /**
   * The actual implementation uses an iOS `UIImage`.
   */
  private let uiImage: UIImage
  /**
   * Get the memory size of the Swift class, and the `UIImage` we allocated so JS
   * can efficiently garbage collect it when needed.
   */
  public var memorySize: Int {
    return uiImage.memorySize
  }

  /**
   * We can initialize instances of `Image` from within Swift.
   */
  public init(uiImage: UIImage) {
    print("✅ Initializing Image...")
    self.uiImage = uiImage
  }

  deinit {
    print("❌ Destroying Image...")
  }

  public var size: native.ImageSize {
    return .init(uiImage.size.width, uiImage.size.height)
  }

  public var pixelFormat: native.PixelFormat {
    return .rgb
  }

  var someSettableProp: Double = 1.0

  func toArrayBuffer(format: native.ImageFormat) throws -> Double {
    throw RuntimeError.error(withMessage: "toArrayBuffer() is not yet implemented!")
  }

  func saveToFile(path: String, onFinished: @escaping (_ path: String) -> Void) throws {
    print("Save To File called \(path)...")
    DispatchQueue.main.asyncAfter(deadline: .now() + 5, execute: {
      print("Executing callback now...")
      onFinished(path)
      print("Callback executed!")
    })
  }
}


extension UIImage {
  var memorySize: Int {
    guard let cgImage else {
      return 0
    }
    return cgImage.bytesPerRow * cgImage.height
  }
}
