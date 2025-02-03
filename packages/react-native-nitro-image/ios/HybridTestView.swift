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
  var isBlue: Bool = false {
    didSet {
      view.backgroundColor = isBlue ? .systemBlue : .systemRed
    }
  }
}
