//
//  HybridView.swift
//  NitroModules
//
//  Created by Marc Rousavy on 13.01.25.
//

#if canImport(UIKit)

import Foundation
import UIKit

/**
 * A base protocol for all Swift-based Hybrid Views.
 */
public protocol HybridView: HybridObject {
  /**
   * Get the ``UIView`` this HybridView is holding.
   *
   * This value should not change during the lifetime of this ``HybridView``.
   */
  var view: UIView { get }
}

#endif
