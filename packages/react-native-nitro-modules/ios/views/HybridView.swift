//
//  HybridView.swift
//  NitroModules
//
//  Created by Marc Rousavy on 13.01.25.
//

#if canImport(UIKit)

  import Foundation
  import UIKit

  /// A base protocol for all Swift-based Hybrid Views.
  public protocol HybridView: HybridObject {
    /**
     * Get the ``UIView`` this HybridView is holding.
     *
     * This value should not change during the lifetime of this ``HybridView``.
     */
    var view: UIView { get }

    /**
     * Called right before updating props.
     * React props are updated in a single batch/transaction.
     */
    func beforeUpdate()
    /**
     * Called right after updating props.
     * React props are updated in a single batch/transaction.
     */
    func afterUpdate()
  }

  extension HybridView {
    public func beforeUpdate() { /* noop */  }
    public func afterUpdate() { /* noop */  }
  }

  extension HybridView {
    // In a View, this could be the size of the UIView.
    public var memorySize: Int {
      return MemoryHelper.getSizeOf(self.view)
    }
  }

#endif
