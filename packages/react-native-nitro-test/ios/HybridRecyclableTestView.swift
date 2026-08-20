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
  private var nativeDefaultValueSetterCallCount: Double = 0
  private var nativeDefaultValueStorage: Double? = 42

  // Props
  var isBlue: Bool = false {
    didSet {
      if !isRecycled {
        view.backgroundColor = isBlue ? .systemBlue : .systemRed
      }
    }
  }
  var nativeDefaultValue: Double? {
    get {
      return nativeDefaultValueStorage
    }
    set {
      nativeDefaultValueStorage = newValue
      nativeDefaultValueSetterCallCount += 1
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

  func getNativeDefaultValueSetterCallCount() throws -> Double {
    return nativeDefaultValueSetterCallCount
  }

  func beforeUpdate() {
    isRecycled = false
  }

  // Recycling conformance
  func prepareForRecycle() {
    if onDropViewCount != prepareForRecycleCount + 1 {
      invalidLifecycleOrderCount += 1
    }
    prepareForRecycleCount += 1
    nativeDefaultValueStorage = 42
    nativeDefaultValueSetterCallCount = 0
    view.backgroundColor = .yellow
    isRecycled = true
  }
}
