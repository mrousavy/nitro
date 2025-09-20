//
//  HybridViewWithChildren.swift
//  NitroTest
//
//  Created by Patrick Kabwe on 06/05/2025.
//

import Foundation
import UIKit

class HybridViewWithChildren : HybridViewWithChildrenSpec {
  // UIView
  var view: UIView = UIView()
    
    override public init() {
        // view.backgroundColor = .red
    }

  // Props
  var colorScheme: ColorScheme = .light
  var someCallback: () -> Void = { }

  // Methods
  func someMethod() throws -> Void {
    someCallback()
  }
}
