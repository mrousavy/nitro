//
//  HybridChild.swift
//  react-native-nitro-test
//
//  Created by Marc Rousavy on 03.10.24.
//

import Foundation

class HybridChild : HybridChildSpec {
  var baseValue: Double {
    return 20
  }
  var childValue: Double {
    return 30
  }

  func bounceVariant(variant: NamedVariant) throws -> NamedVariant {
    return variant
  }
}
