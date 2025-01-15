//
//  HybridTestView.swift
//  react-native-nitro-image
//
//  Created by Marc Rousavy on 03.10.24.
//

import Foundation
import UIKit

class HybridTestView : HybridTestViewSpec {
  var someProp: Bool = false
  var someCallback: (Double) -> Void = { d in }
  
  var view: UIView = UIView()
  
  func someFunc(someParam: Double) throws -> Bool {
    return someProp
  }
}
