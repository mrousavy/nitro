//
//  HybridChild.swift
//  react-native-nitro-image
//
//  Created by Marc Rousavy on 03.10.24.
//

import Foundation

class HybridChild : HybridChildSpec {
  var hybridContext = margelo.nitro.HybridContext()
  var memorySize: Int {
    return getSizeOf(self)
  }
  
  var baseValue: Double {
    return 20
  }
  var childValue: Double {
    return 30
  }
}
