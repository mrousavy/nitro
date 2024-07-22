//
//  ImageFactory.swift
//  NitroImage
//
//  Created by Marc Rousavy on 22.07.24.
//

import Foundation
import NitroModules

class ImageFactory : ImageFactorySpec {
  var hybridContext = margelo.nitro.HybridContext()
  
  var memorySize: Int {
    return getSizeOf(self)
  }
  
  func loadImageFromFile(path: String) throws -> any ImageSpec {
    guard let uiImage = UIImage(contentsOfFile: path) else {
      throw RuntimeError.error(withMessage: "Failed to load UIImage from \(path)!")
    }
    return Image(uiImage: uiImage)
  }
  
  func loadImageFromURL(path: String) throws -> any ImageSpec {
    guard let uiImage = UIImage(contentsOfFile: path) else {
      throw RuntimeError.error(withMessage: "Failed to load UIImage from \(path)!")
    }
    return Image(uiImage: uiImage)
  }
  
  func loadImageFromSystemName(path: String) throws -> any ImageSpec {
    guard let uiImage = UIImage(systemName: path) else {
      throw RuntimeError.error(withMessage: "Failed to load system UIImage \"\(path)\"!")
    }
    return Image(uiImage: uiImage)
  }
  
  func bounceBack(image: any ImageSpec) throws -> any ImageSpec {
    print("bouncing back...")
    return image
  }
}
