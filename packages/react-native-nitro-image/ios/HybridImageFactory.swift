//
//  HybridImageFactory.swift
//  NitroImage
//
//  Created by Marc Rousavy on 22.07.24.
//

import Foundation
import NitroModules

class HybridImageFactory : HybridImageFactorySpec {
  func loadImageFromFile(path: String) throws -> any HybridImageSpec {
    guard let uiImage = UIImage(contentsOfFile: path) else {
      throw RuntimeError.error(withMessage: "Failed to load UIImage from \(path)!")
    }
    return HybridImage(uiImage: uiImage)
  }

  func loadImageFromURL(path: String) throws -> any HybridImageSpec {
    guard let url = URL(string: path) else {
      throw RuntimeError.error(withMessage: "Invalid URL! \(path)")
    }
    let data = try Data(contentsOf: url)
    guard let uiImage = UIImage(data: data) else {
      throw RuntimeError.error(withMessage: "Failed to load UIImage from \(path)!")
    }
    return HybridImage(uiImage: uiImage)
  }

  func loadImageFromSystemName(path: String) throws -> any HybridImageSpec {
    guard let uiImage = UIImage(systemName: path) else {
      throw RuntimeError.error(withMessage: "Failed to load system UIImage \"\(path)\"!")
    }
    return HybridImage(uiImage: uiImage)
  }

  func bounceBack(image: any HybridImageSpec) throws -> any HybridImageSpec {
    print("bouncing back...")
    return image
  }
}
