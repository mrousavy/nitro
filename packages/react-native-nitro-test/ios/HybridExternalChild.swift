//
//  HybridExternalChild.swift
//  react-native-nitro-test
//
//  Created by Marc Rousavy on 03.10.24.
//

import Foundation

class HybridExternalChild: HybridExternalChildSpec {
  var baseValue: Double {
    return 40
  }

  func bounceString(string: String) throws -> String {
    return string
  }

  func toString() -> String {
    return "HybridExternalChild custom toString() :)"
  }
}
