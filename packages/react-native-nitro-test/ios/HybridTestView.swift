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
  private var isBlueUpdateCount: Double = 0
  var isBlue: Bool = false {
    didSet {
      isBlueUpdateCount += 1
      view.backgroundColor = isBlue ? .systemBlue : .systemRed
    }
  }
  var hasBeenCalled: Bool = false
  var colorScheme: ColorScheme = .light
  var someCallback: () -> Void = {}
  var optionalLabel: String? = nil
  var optionalCallback: (() -> Void)? = nil

  // Methods
  func someMethod() throws {
    hasBeenCalled = true
    someCallback()
  }

  func getIsBlueUpdateCount() throws -> Double {
    return isBlueUpdateCount
  }
}
