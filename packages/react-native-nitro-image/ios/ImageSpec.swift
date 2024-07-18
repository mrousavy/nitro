//
//  ImageSpec.swift
//  react-native-nitro-image
//
//  Created by Marc Rousavy on 17.07.24.
//

public protocol ImageSpec {
  var width: Int { get }
  var height: Int { get }
  var pixelFormat: PixelFormat { get }
  
  func toArrayBuffer(format: ImageFormat) -> Data
}
