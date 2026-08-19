//
//  HybridRecyclableTestView.swift
//  react-native-nitro-test
//
//  Created by Marc Rousavy on 03.10.24.
//

import NitroModules
import UIKit

class HybridRecyclableTestView: HybridRecyclableTestViewSpec, RecyclableView {
  // UIView
  var view: UIView = UIView()
  private var isRecycled = false
  private var invalidLifecycleOrderCount: Double = 0
  private var onDropViewCount: Double = 0
  private var prepareForRecycleCount: Double = 0

  // Props
  var isBlue: Bool = false {
    didSet {
      if !isRecycled {
        view.backgroundColor = isBlue ? .systemBlue : .systemRed
      }
    }
  }

  func onDropView() {
    onDropViewCount += 1
    print("View dropped!")
  }

  func getOnDropViewCount() throws -> Double {
    return onDropViewCount
  }

  func getInvalidLifecycleOrderCount() throws -> Double {
    return invalidLifecycleOrderCount
  }

  func getPrepareForRecycleCount() throws -> Double {
    return prepareForRecycleCount
  }

  // Recycling conformance
  func prepareForRecycle() {
    if onDropViewCount != prepareForRecycleCount + 1 {
      invalidLifecycleOrderCount += 1
    }
    prepareForRecycleCount += 1
    view.backgroundColor = .yellow
    isRecycled = true
  }
}
