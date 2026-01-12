//
//  HybridRecyclableTestView.swift
//  react-native-nitro-test
//
//  Created by Marc Rousavy on 03.10.24.
//

import Foundation
import UIKit
import NitroModules

class HybridRecyclableTestView: HybridRecyclableTestViewSpec, RecyclableView {
  // UIView
  var view: UIView = UIView()

  // Props
  var isBlue: Bool = false {
    didSet {
      view.backgroundColor = isBlue ? .systemBlue : .systemRed
    }
  }

  // Recycling conformance
  func prepareForRecycle() {
    view.backgroundColor = .yellow
  }
}
