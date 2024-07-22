//
//  NitroImageRegistry.swift
//  NitroImage
//
//  Created by Marc Rousavy on 22.07.24.
//

import Foundation

public class NitroImageRegistry {
  public static func createImageFactory() -> ImageFactorySpecCxx {
    let imageFactory = ImageFactory()
    return ImageFactorySpecCxx(imageFactory)
  }
}
