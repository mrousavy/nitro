//
//  HybridTestView.swift
//  react-native-nitro-test
//
//  Created by Marc Rousavy on 03.10.24.
//

import NitroModules
import UIKit

class HybridTestView: HybridTestViewSpec {
  // UIView
  var view: UIView = UIView()
  private var onDropViewCount: Double = 0

  // Props
  var isBlue: Bool = false {
    didSet {
      view.backgroundColor = isBlue ? .systemBlue : .systemRed
    }
  }
  var hasBeenCalled: Bool = false
  var colorScheme: ColorScheme = .light
  var someCallback: () -> Void = {}

  // Methods
  func getOnDropViewCount() throws -> Double {
    return onDropViewCount
  }

  func someMethod() throws {
    hasBeenCalled = true
    someCallback()
  }

  func onDropView() {
    onDropViewCount += 1
  }
}
