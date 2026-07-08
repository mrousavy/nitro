//
//  MeasurableView.swift
//  NitroModules
//
//  Created by Patrick Kabwe on 13.06.26.
//

/// A `HybridView` type that computes its own intrinsic size,
/// instead of being laid out purely by its React children.
///
/// Opt in by conforming your `HybridView` implementation type to this protocol
/// and implementing the generated static
/// `measureContent(props:layoutContext:layoutConstraints:)` signature.
/// Conformance is detected at registration; Nitro then makes this view a
/// measurable Yoga leaf.
///
/// - Important: `measureContent` runs on the **shadow/layout thread** and is
///   given no view. You must measure purely from `props` using a thread-safe
///   API (e.g. `NSAttributedString.boundingRect`). Never access the live
///   `UIView`. The result is cached by Yoga keyed on `props` + constraints, so
///   the function must be deterministic.
///
/// - Note: A measurable view is a Yoga **leaf** and therefore cannot host React
///   children - this is its own feature, mutually exclusive with children.
///
public protocol MeasurableView: HybridView {
  static func measureContent<Props, LayoutContext, LayoutConstraints, Size>(
    props: Props,
    layoutContext: LayoutContext,
    layoutConstraints: LayoutConstraints
  ) -> Size
}

public extension MeasurableView {
  static func measureContent<Props, LayoutContext, LayoutConstraints, Size>(
    props: Props,
    layoutContext: LayoutContext,
    layoutConstraints: LayoutConstraints
  ) -> Size {
    fatalError("\(Self.self) conforms to MeasurableView but does not implement the generated measureContent(props:layoutContext:layoutConstraints:) signature.")
  }
}
