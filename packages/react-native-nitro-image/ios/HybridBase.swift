//
//  HybridBase.swift
//  react-native-nitro-image
//
//  Created by Marc Rousavy on 03.10.24.
//

import Foundation

class HybridBase : HybridBaseSpec {
  var hybridContext = margelo.nitro.HybridContext()
  var memorySize: Int {
    return getSizeOf(self)
  }

  var baseValue: Double {
    return 10
  }
}
