//
//  HybridExternalChild.swift
//  react-native-nitro-test
//
//  Created by Marc Rousavy on 03.10.24.
//

import Foundation

class HybridExternalChild: HybridExternalChildSpec {
  func bounceString(string: String) throws -> String {
    return string
  }
  func getValue() throws -> String {
    return "external!"
  }

  func toString() -> String {
    return "HybridExternalChild custom toString() :)"
  }
}
