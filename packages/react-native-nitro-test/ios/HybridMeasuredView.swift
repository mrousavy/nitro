//
//  HybridMeasuredView.swift
//  react-native-nitro-test
//
//  Created by Patrick Kabwe on 14.06.26.
//

import NitroModules
import UIKit

final class HybridMeasuredView: HybridMeasuredViewSpec, MeasurableView {
  let view: UILabel = {
    let label = UILabel()
    label.numberOfLines = 0
    return label
  }()

  // Props
  var text: String = "" {
    didSet { view.text = text }
  }
  var fontSize: Double = 17 {
    didSet { view.font = .systemFont(ofSize: fontSize) }
  }

  static func measureContent(
    props: MeasuredViewProps, layoutContext: LayoutContext, layoutConstraints: LayoutConstraints
  ) -> Size {
    let maxWidth =
      layoutConstraints.maximumSize.width.isFinite
      ? layoutConstraints.maximumSize.width : Double.greatestFiniteMagnitude

    let attributed = NSAttributedString(
      string: props.text, attributes: [.font: UIFont.systemFont(ofSize: props.fontSize)])

    let rect = attributed.boundingRect(
      with: CGSize(width: maxWidth, height: .greatestFiniteMagnitude),
      options: [.usesLineFragmentOrigin, .usesFontLeading], context: nil)

    return Size(width: ceil(rect.width), height: ceil(rect.height))
  }
}
