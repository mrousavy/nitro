import type { SourceFile } from '../../syntax/SourceFile.js'
import type { HybridObjectSpec } from '../../syntax/HybridObjectSpec.js'
import type { StructType } from '../../syntax/types/StructType.js'
import { createFileMetadataString } from '../../syntax/helpers.js'
import { getHybridObjectName } from '../../syntax/getHybridObjectName.js'
import { SwiftCxxBridgedType } from '../../syntax/swift/SwiftCxxBridgedType.js'
import { getViewComponentNames } from '../CppHybridViewComponent.js'
import {
  buildMeasureGeometryStructs,
  buildMeasurePropsStruct,
  getMeasureProps,
} from '../createViewMeasurerShared.js'

function getMeasurePropsStruct(spec: HybridObjectSpec) {
  return buildMeasurePropsStruct(spec, ['swift', 'c++'])
}

function getGeometryStructs() {
  return buildMeasureGeometryStructs(['swift', 'c++'])
}

export function getSwiftMeasurerName(spec: HybridObjectSpec): string {
  const { HybridT } = getHybridObjectName(spec.name)
  return `${HybridT}Measurer`
}

function structFiles(struct: StructType): SourceFile[] {
  return [
    ...struct.getExtraFiles(),
    ...new SwiftCxxBridgedType(struct).getExtraFiles(),
  ]
}

export function createSwiftViewMeasurer(spec: HybridObjectSpec): SourceFile[] {
  const implementation = spec.config.getIosAutolinkedImplementation(spec.name)
  if (implementation?.language !== 'swift') {
    throw new Error(
      `Cannot create Swift MeasurableView trampoline for ${spec.name} - it must be autolinked with a Swift iOS implementation in nitro.json!`
    )
  }
  const swiftClassName = implementation.implementationClassName
  const measurerName = getSwiftMeasurerName(spec)
  const propsStruct = getMeasurePropsStruct(spec)
  const propsStructName = propsStruct.structName
  const geometry = getGeometryStructs()

  const code = `
${createFileMetadataString(`${measurerName}.swift`)}

import NitroModules

extension ${swiftClassName} {
  static func measureContent<Props, LayoutContext, LayoutConstraints, Size>(
    props: Props,
    layoutContext: LayoutContext,
    layoutConstraints: LayoutConstraints
  ) -> Size {
    fatalError("${swiftClassName} cannot be measured because it does not implement the generated measureContent(props:layoutContext:layoutConstraints:) signature.")
  }
}

/// Generated trampoline bridging the C++ ShadowNode's \`measureContent\` to
/// ${swiftClassName}'s \`MeasurableView.measureContent(...)\`. Do not call directly.
///
/// All four boundary types are Nitro structs, so each crosses the Swift<->C++
/// boundary as a single value.
public final class ${measurerName} {
  /// The conformance is resolved once and cached - the per-measure path then
  /// avoids re-checking against the metatype on every layout pass.
  private static let isMeasurableView: Bool = ${swiftClassName}.self is any MeasurableView.Type

  /// Type-level conformance check - no instance required.
  public static func isMeasurable() -> Bool {
    return isMeasurableView
  }

  public static func measure(props: ${propsStructName},
                             layoutContext: LayoutContext,
                             layoutConstraints: LayoutConstraints) -> Size {
    return ${swiftClassName}.measureContent(
      props: props,
      layoutContext: layoutContext,
      layoutConstraints: layoutConstraints
    )
  }
}
`.trim()

  return [
    ...structFiles(propsStruct),
    ...structFiles(geometry.size),
    ...structFiles(geometry.layoutContext),
    ...structFiles(geometry.layoutConstraints),
    {
      content: code,
      language: 'swift',
      name: `${measurerName}.swift`,
      platform: 'ios',
      subdirectory: ['views'],
    },
  ]
}

/**
 * Generates the Objective-C++ snippet (placed in the ViewManager's `+load`)
 * that installs this view's `measureFunction` on its ShadowNode when the native
 * implementation conforms to `MeasurableView`.
 */
export function createSwiftViewMeasurerRegistration(
  spec: HybridObjectSpec,
  swiftNamespace: string
): string {
  const { propsClassName, shadowNodeClassName } = getViewComponentNames(spec)
  const measurerName = getSwiftMeasurerName(spec)
  const props = getMeasureProps(spec)
  const propsStruct = getMeasurePropsStruct(spec)
  const geometry = getGeometryStructs()
  const propsCxx = propsStruct.getCode('c++', { fullyQualified: true })
  const sizeCxx = geometry.size.getCode('c++', { fullyQualified: true })
  const contextCxx = geometry.layoutContext.getCode('c++', {
    fullyQualified: true,
  })
  const constraintsCxx = geometry.layoutConstraints.getCode('c++', {
    fullyQualified: true,
  })

  const propsFields = props
    .map((p) => `/* ${p.name} */ props.${p.name}.value`)
    .join(',\n        ')

  return `
// Install self-measurement iff "${spec.name}" conforms to \`MeasurableView\`.
if (${swiftNamespace}::${measurerName}::isMeasurable()) {
  ${shadowNodeClassName}::measureFunction.store(
    +[](const react::ViewProps& propsBase,
        const react::LayoutContext& layoutContext,
        const react::LayoutConstraints& layoutConstraints) -> react::Size {
      const auto& props = static_cast<const ${propsClassName}&>(propsBase);
      ${propsCxx} measureProps {
        ${propsFields}
      };
      ${contextCxx} measureContext {
        /* pointScaleFactor */ layoutContext.pointScaleFactor,
        /* isRTL */ layoutConstraints.layoutDirection == react::LayoutDirection::RightToLeft
      };
      ${constraintsCxx} measureConstraints {
        /* minimumSize */ ${sizeCxx} { layoutConstraints.minimumSize.width, layoutConstraints.minimumSize.height },
        /* maximumSize */ ${sizeCxx} { layoutConstraints.maximumSize.width, layoutConstraints.maximumSize.height }
      };
      auto size = ${swiftNamespace}::${measurerName}::measure(measureProps, measureContext, measureConstraints);
      return react::Size { static_cast<react::Float>(size.width), static_cast<react::Float>(size.height) };
    },
    std::memory_order_release);
}
`.trim()
}
