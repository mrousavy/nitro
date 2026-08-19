import type { SourceFile } from '../syntax/SourceFile.js'
import type { HybridObjectSpec } from '../syntax/HybridObjectSpec.js'
import { createIndentation, indent } from '../utils.js'
import {
  createFileMetadataString,
  escapeCppName,
  isFunction,
  isNotDuplicate,
} from '../syntax/helpers.js'
import { getHybridObjectName } from '../syntax/getHybridObjectName.js'
import { includeHeader } from '../syntax/c++/includeNitroHeader.js'
import { createHostComponentJs } from './createHostComponentJs.js'
import { Property } from '../syntax/Property.js'
import { FunctionType } from '../syntax/types/FunctionType.js'
import { VoidType } from '../syntax/types/VoidType.js'
import { HybridObjectType } from '../syntax/types/HybridObjectType.js'
import { NamedWrappingType } from '../syntax/types/NamedWrappingType.js'
import { OptionalType } from '../syntax/types/OptionalType.js'

interface ViewComponentNames {
  propsClassName: `${string}Props`
  stateClassName: `${string}State`
  nameVariable: `${string}ComponentName`
  shadowNodeClassName: `${string}ShadowNode`
  descriptorClassName: `${string}ComponentDescriptor`
  component: `${string}Component`
  manager: `${string}Manager`
}

export function getViewComponentNames(
  spec: HybridObjectSpec
): ViewComponentNames {
  const name = getHybridObjectName(spec.name)
  return {
    propsClassName: `${name.HybridT}Props`,
    stateClassName: `${name.HybridT}State`,
    nameVariable: `${name.HybridT}ComponentName`,
    shadowNodeClassName: `${name.HybridT}ShadowNode`,
    descriptorClassName: `${name.HybridT}ComponentDescriptor`,
    component: `${name.HybridT}Component`,
    manager: `${name.HybridT}Manager`,
  }
}

function getHybridRefProperty(spec: HybridObjectSpec): Property {
  const hybrid = new HybridObjectType(spec)
  const type = new FunctionType(new VoidType(), [
    new NamedWrappingType('ref', hybrid),
  ])
  return new Property('hybridRef', new OptionalType(type), false)
}

export function createViewComponentShadowNodeFiles(
  spec: HybridObjectSpec
): SourceFile[] {
  if (!spec.isHybridView) {
    throw new Error(
      `Cannot create View Component ShadowNode code for ${spec.name} - it's not a HybridView!`
    )
  }

  const { T, HybridT } = getHybridObjectName(spec.name)
  const {
    propsClassName,
    stateClassName,
    nameVariable,
    shadowNodeClassName,
    descriptorClassName,
    component,
  } = getViewComponentNames(spec)

  const namespace = spec.config.getCxxNamespace('c++', 'views')

  const props = [...spec.properties, getHybridRefProperty(spec)]
  const properties = props.map(
    (p) => `CachedProp<${p.type.getCode('c++')}> ${escapeCppName(p.name)};`
  )
  const cases = props.map((p) => `case hashString("${p.name}"): return true;`)
  const comparisons = props.map((p) => {
    const name = escapeCppName(p.name)
    return `${name}.hasSameValue(other.${name})`
  })
  const includes = props
    .flatMap((p) =>
      p.getRequiredImports('c++').map((i) => includeHeader(i, true))
    )
    .filter(isNotDuplicate)

  // .hpp code
  const shadowIndent = createIndentation(shadowNodeClassName.length)
  const componentHeaderCode = `
${createFileMetadataString(`${component}.hpp`)}

#pragma once

#include <optional>
#include <NitroModules/NitroDefines.hpp>
#include <NitroModules/NitroHash.hpp>
#include <NitroModules/CachedProp.hpp>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/StateData.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/view/ViewProps.h>
#include <NitroModules/ViewComponentDescriptor.hpp>
#ifdef ANDROID
#include <NitroModules/ViewPropsHolderState.hpp>
#endif

#if __has_include(<cxxreact/ReactNativeVersion.h>)
#include <cxxreact/ReactNativeVersion.h>
#endif

${includes.join('\n')}

namespace ${namespace} {

  using namespace facebook;

  /**
   * The name of the actual native View.
   */
  extern const char ${nameVariable}[];

  /**
   * Props for the "${spec.name}" View.
   */
  class ${propsClassName} final: public react::ViewProps {
  public:
    ${propsClassName}() = default;
    ${propsClassName}(const react::PropsParserContext& context,
  ${createIndentation(propsClassName.length)}   const ${propsClassName}& sourceProps,
  ${createIndentation(propsClassName.length)}   const react::RawProps& rawProps);

  public:
    ${indent(properties.join('\n'), '    ')}

    [[nodiscard]]
    bool hasSameProps(const ${propsClassName}& other) const noexcept {
      return ${comparisons.join(' &&\n             ')};
    }

#if defined(RN_SERIALIZABLE_STATE) && defined(REACT_NATIVE_VERSION_MINOR) && REACT_NATIVE_VERSION_MINOR >= 84
    void initializeDynamicProps(const ${propsClassName}& sourceProps, const react::RawProps& rawProps) {
      react::ViewProps::initializeDynamicProps(sourceProps, rawProps, filterObjectKeys);
    }
#endif

  private:
    static bool filterObjectKeys(const std::string& propName);
  };

  /**
   * State for the "${spec.name}" View.
   */
#ifdef ANDROID
  using ${stateClassName} = nitro::ViewPropsHolderState<${propsClassName}>;
#else
  using ${stateClassName} = react::StateData;
#endif

  /**
   * The Shadow Node for the "${spec.name}" View.
   */
  using ${shadowNodeClassName} = react::ConcreteViewShadowNode<${nameVariable} /* "${HybridT}" */,
        ${shadowIndent}                                 ${propsClassName} /* custom props */,
        ${shadowIndent}                                 react::ViewEventEmitter /* default */,
        ${shadowIndent}                                 ${stateClassName} /* custom state */>;

  /**
   * The Component Descriptor for the "${spec.name}" View.
   */
  using ${descriptorClassName} = nitro::ViewComponentDescriptor<${shadowNodeClassName}>;

  /* The actual view for "${spec.name}" needs to be implemented in platform-specific code. */

} // namespace ${namespace}
`.trim()

  // .cpp code
  const propInitializers = [
    'react::ViewProps(context, sourceProps, rawProps, filterObjectKeys)',
  ]
  for (const prop of props) {
    const name = escapeCppName(prop.name)
    const type = prop.type.getCode('c++')

    let valueConversion = `value`
    const isOptional = prop.type instanceof OptionalType
    if (isFunction(prop.type)) {
      // Due to a React limitation, functions cannot be passed to native directly,
      // because RN converts them to booleans (`true`). Nitro knows this and just
      // wraps functions as objects - the original function is stored in `f`.
      valueConversion = `value.asObject(*runtime).getProperty(*runtime, PropNameIDCache::get(*runtime, "f"))`
    }

    propInitializers.push(
      `
${name}([&]() -> CachedProp<${type}> {
  try {
    const react::RawValue* rawValue = rawProps.at("${prop.name}", nullptr, nullptr);
    if (rawValue == nullptr) return sourceProps.${name};
    const auto& [runtime, value] = (std::pair<jsi::Runtime*, jsi::Value>)*rawValue;
    if (value.isNull() || value.isUndefined()) {
      ${
        isOptional
          ? `return CachedProp<${type}>::fromRawValue(*runtime, jsi::Value::undefined(), sourceProps.${name});`
          : `throw std::runtime_error("Required view prop cannot be removed/reset.");`
      }
    }
    return CachedProp<${type}>::fromRawValue(*runtime, ${valueConversion}, sourceProps.${name});
  } catch (const std::exception& exc) {
    throw std::runtime_error(std::string("${spec.name}.${prop.name}: ") + exc.what());
  }
}())`.trim()
    )
  }

  const ctorIndent = createIndentation(propsClassName.length * 2)
  const componentCode = `
${createFileMetadataString(`${component}.cpp`)}

#include "${component}.hpp"

#include <string>
#include <exception>
#include <utility>
#include <NitroModules/NitroDefines.hpp>
#include <NitroModules/JSIConverter.hpp>
#include <NitroModules/PropNameIDCache.hpp>
#include <react/renderer/core/RawValue.h>
#include <react/renderer/core/ShadowNode.h>
#include <react/renderer/core/ComponentDescriptor.h>
#include <react/renderer/components/view/ViewProps.h>

namespace ${namespace} {

  extern const char ${nameVariable}[] = "${T}";

  ${propsClassName}::${propsClassName}(const react::PropsParserContext& context,
  ${ctorIndent}   const ${propsClassName}& sourceProps,
  ${ctorIndent}   const react::RawProps& rawProps):
    ${indent(propInitializers.join(',\n'), '    ')} { }

  bool ${propsClassName}::filterObjectKeys(const std::string& propName) {
    switch (hashString(propName)) {
      ${indent(cases.join('\n'), '      ')}
      default: return false;
    }
  }

} // namespace ${namespace}
`.trim()

  const files: SourceFile[] = [
    {
      name: `${component}.hpp`,
      content: componentHeaderCode,
      language: 'c++',
      platform: 'shared',
      subdirectory: ['views'],
    },
    {
      name: `${component}.cpp`,
      content: componentCode,
      language: 'c++',
      platform: 'shared',
      subdirectory: ['views'],
    },
  ]
  const jsFiles = createHostComponentJs(spec)
  files.push(...(jsFiles as unknown as SourceFile[]))
  return files
}
