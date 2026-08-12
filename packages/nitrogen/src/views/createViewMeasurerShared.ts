import type { HybridObjectSpec } from '../syntax/HybridObjectSpec.js'
import type { Language } from '../getPlatformSpecs.js'
import { isFunction } from '../syntax/helpers.js'
import { StructType } from '../syntax/types/StructType.js'
import { NamedWrappingType } from '../syntax/types/NamedWrappingType.js'
import { NumberType } from '../syntax/types/NumberType.js'
import { BooleanType } from '../syntax/types/BooleanType.js'
import { addKnownType } from '../syntax/createType.js'

export function getMeasureProps(spec: HybridObjectSpec) {
  return spec.properties.filter((p) => !isFunction(p.type))
}

export function getMeasurePropsStructName(spec: HybridObjectSpec): string {
  return `${spec.name}Props`
}

export function buildMeasurePropsStruct(
  spec: HybridObjectSpec,
  languages: Language[]
): StructType {
  const props = getMeasureProps(spec)
  const struct = new StructType(
    getMeasurePropsStructName(spec),
    props.map((p) => new NamedWrappingType(p.name, p.type))
  )
  for (const language of languages) {
    addKnownType(struct.structName, struct, language)
  }
  return struct
}

export interface MeasureGeometryStructs {
  size: StructType
  layoutContext: StructType
  layoutConstraints: StructType
}

export function buildMeasureGeometryStructs(
  languages: Language[]
): MeasureGeometryStructs {
  const size = new StructType('Size', [
    new NamedWrappingType('width', new NumberType()),
    new NamedWrappingType('height', new NumberType()),
  ])
  const layoutContext = new StructType('LayoutContext', [
    new NamedWrappingType('pointScaleFactor', new NumberType()),
    new NamedWrappingType('isRTL', new BooleanType()),
  ])
  const layoutConstraints = new StructType('LayoutConstraints', [
    new NamedWrappingType('minimumSize', size),
    new NamedWrappingType('maximumSize', size),
  ])
  for (const language of languages) {
    addKnownType(size.structName, size, language)
    addKnownType(layoutContext.structName, layoutContext, language)
    addKnownType(layoutConstraints.structName, layoutConstraints, language)
  }
  return { size, layoutContext, layoutConstraints }
}
