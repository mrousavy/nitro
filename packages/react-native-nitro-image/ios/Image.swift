//
//  Image.swift
//  react-native-nitro-image
//
//  Created by Marc Rousavy on 18.07.24.
//

import Foundation
import UIKit
import NitroModules

class Image : ImageSpec {
  private let uiImage: UIImage
  public var hybridContext = margelo.nitro.HybridContext()
  public var memorySize: Int {
    return getSizeOf(self) + uiImage.memorySize
  }

  public init(uiImage: UIImage) {
    print("✅ Initializing Image...")
    self.uiImage = uiImage
  }

  deinit {
    print("❌ Destroying Image...")
  }

  public var size: ImageSize {
    return ImageSize(uiImage.size.width, uiImage.size.height)
  }

  public var pixelFormat: PixelFormat {
    return .rgb
  }

  var someSettableProp: Double = 1.0

  func toArrayBuffer(format: ImageFormat) throws -> Double {
    throw RuntimeError.error(withMessage: "toArrayBuffer() is not yet implemented!")
  }

  func saveToFile(path: String, onFinished: Func_void_std__string) throws {
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
