//
//  Image.swift
//  react-native-nitro-image
//
//  Created by Marc Rousavy on 18.07.24.
//

import Foundation
import UIKit

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
  
  public func toArrayBuffer(format: ImageFormat) -> Data {
    switch format {
    case .jpg:
      return uiImage.jpegData(compressionQuality: 1.0)
    case .png:
      return uiImage.pngData()
    }
  }
}
