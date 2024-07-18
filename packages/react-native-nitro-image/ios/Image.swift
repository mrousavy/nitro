//
//  Image.swift
//  react-native-nitro-image
//
//  Created by Marc Rousavy on 18.07.24.
//

import Foundation
import UIKit
import NitroModules

public class Image : ImageSpec {
  private let uiImage: UIImage
  
  public init(uiImage: UIImage) {
    self.uiImage = uiImage
  }
  
  public var width: Int {
    return Int(uiImage.size.width)
  }
  
  public var height: Int {
    return Int(uiImage.size.height)
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
}
