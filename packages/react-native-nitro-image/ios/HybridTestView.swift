//
//  HybridTestView.swift
//  react-native-nitro-image
//
//  Created by Marc Rousavy on 03.10.24.
//

import Foundation
import UIKit

class HybridTestView : HybridTestViewSpec {
  // UIView
  var view: UIView = UIView()
  
  // Props
  var someCallback: (Double) -> Void = { d in }
  var someProp: Bool = false {
    didSet {
      view.backgroundColor = someProp ? .systemRed : .systemBlue
    }
  }
  
  // Methods
  func someFunc(someParam: Double) throws -> Bool {
    return someProp
  }
}
