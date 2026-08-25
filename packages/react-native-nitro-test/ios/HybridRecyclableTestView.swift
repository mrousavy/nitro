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
  private let lifecycleLock = NSLock()
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
    print("View dropped!")
    withLifecycleLock {
      onDropViewCount += 1
    }
  }

  func getOnDropViewCount() throws -> Double {
    return withLifecycleLock { onDropViewCount }
  }

  func getInvalidLifecycleOrderCount() throws -> Double {
    return withLifecycleLock { invalidLifecycleOrderCount }
  }

  func getPrepareForRecycleCount() throws -> Double {
    return withLifecycleLock { prepareForRecycleCount }
  }

  func getNativeDefaultValueSetterCallCount() throws -> Double {
    return nativeDefaultValueSetterCallCount
  }

  func beforeUpdate() {
    isRecycled = false
  }

  // Recycling conformance
  func prepareForRecycle() {
    nativeDefaultValueStorage = 42
    nativeDefaultValueSetterCallCount = 0
    view.backgroundColor = .yellow
    isRecycled = true

    withLifecycleLock {
      if onDropViewCount != prepareForRecycleCount + 1 {
        invalidLifecycleOrderCount += 1
      }
      prepareForRecycleCount += 1
    }
  }

  private func withLifecycleLock<Result>(_ operation: () throws -> Result) rethrows -> Result {
    lifecycleLock.lock()
    defer { lifecycleLock.unlock() }
    return try operation()
  }
}
