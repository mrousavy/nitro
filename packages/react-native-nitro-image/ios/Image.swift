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
  var someSettableProp: Double = 1.0
  
  func toArrayBuffer(format: ImageFormat) throws -> margelo.nitro.ArrayBuffer {
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
  
  public var hybridContext = margelo.nitro.HybridContext()
  
  private let uiImage: UIImage

  public init(uiImage: UIImage) {
    self.uiImage = uiImage
  }
  
  public var size: ImageSize {
    return ImageSize(uiImage.size.width, uiImage.size.height)
  }

  public var pixelFormat: PixelFormat {
    return .rgb
  }
}
