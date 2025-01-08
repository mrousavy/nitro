//
//  HybridView.swift
//  NitroModules
//
//  Created by Marc Rousavy on 23.07.24.
//

#if canImport(UIKit)

import Foundation
import UIKit

/**
 * A base protocol for all Swift-based Hybrid Views.
 */
public protocol HybridView: HybridObjectSpec {
  /**
   * Get the view that this HybridView holds.
   *
   * @example
   * ```swift
   * let view: UIView = UIImageView()
   * ```
   */
  var view: UIView { get }
}

#endif
