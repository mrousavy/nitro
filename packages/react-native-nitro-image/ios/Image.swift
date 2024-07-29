//
//  Image.swift
//  react-native-nitro-image
//
//  Created by Marc Rousavy on 18.07.24.
//

import Foundation
import UIKit
import NitroModules

/**
 * Implement `ImageSpec` so we can expose this Swift class to JS.
 */
class Image : ImageSpec {
  /**
   * Alias the namespace so we don't have to write it out each time.
   */
  typealias native = margelo.nitro.image
  /**
   * The actual implementation uses an iOS `UIImage`.
   */
  private let uiImage: UIImage
  /**
   * Just default initialize HybridContext - this holds the C++ state.
   */
  public var hybridContext = margelo.nitro.HybridContext()
  /**
   * Get the memory size of the Swift class, and the `UIImage` we allocated so JS
   * can efficiently garbage collect it when needed.
   */
  public var memorySize: Int {
    return getSizeOf(self) + uiImage.memorySize
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

  func saveToFile(path: String, onFinished: native.Func_void_std__string) throws {
    print("Save To File called \(path)...")
    DispatchQueue.main.asyncAfter(deadline: .now() + 5, execute: {
      print("Executing callback now...")
      onFinished(std.string(path))
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
