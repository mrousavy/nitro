//
//  NitroImageRegistry.swift
//  NitroImage
//
//  Created by Marc Rousavy on 22.07.24.
//

import Foundation

public class NitroImageRegistry {
  public static func createImageFactory() -> HybridImageFactorySpecCxx {
    let imageFactory = HybridImageFactory()
    return HybridImageFactorySpecCxx(imageFactory)
  }
  public static func createSwiftKotlinTestObject() -> HybridSwiftKotlinTestObjectSpecCxx {
    let testObject = HybridSwiftKotlinTestObject()
    return HybridSwiftKotlinTestObjectSpecCxx(testObject)
  }
}
