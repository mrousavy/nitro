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
  
  func toArrayBuffer(format: ImageFormat) throws -> Double {
    throw RuntimeError.error(withMessage: "toArrayBuffer() is not yet implemented!")
  }
  
  func saveToFile(path: String) throws {
    throw RuntimeError.error(withMessage: "saveToFile() is not yet implemented!")
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

  public func toArrayBuffer(format: ImageFormat) throws -> Data {
    switch format {
    case .jpg:
      guard let data = uiImage.jpegData(compressionQuality: 1.0) else {
        throw RuntimeError.error(withMessage: "JPG data is nil!")
      }
      return data
    case .png:
      guard let data = uiImage.pngData() else {
        throw RuntimeError.error(withMessage: "PNG data is nil!")
      }
      return data
    }
  }

  public func saveToFile(path: String) throws -> Promise<Void> {
    let data: Data = try toArrayBuffer(format: .jpg)
    guard let url = URL(string: path) else {
      throw RuntimeError.error(withMessage: "Path \"\(path)\" is not a valid URL!")
    }
    try data.write(to: url)
    
    // TODO: Actually implement Promises
    return Promise<Void>.resolved()
  }
}
