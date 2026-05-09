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

  // Props
  var isCyan: Bool = false {
    didSet {
      view.backgroundColor = isCyan ? .systemCyan : .systemBlue
    }
  }
  var hasBeenCalled: Bool = false
  var testCallback: () -> Void = {}

  // Methods
  func testMethod() throws {
    hasBeenCalled = true
    testCallback()
  }
}
