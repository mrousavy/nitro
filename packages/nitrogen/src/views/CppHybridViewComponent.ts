import type { SourceFile } from '../syntax/SourceFile.js'
import type { HybridObjectSpec } from '../syntax/HybridObjectSpec.js'
import { createIndentation, indent } from '../utils.js'
import { createFileMetadataString, escapeCppName } from '../syntax/helpers.js'
import { NitroConfig } from '../config/NitroConfig.js'
import { getHybridObjectName } from '../syntax/getHybridObjectName.js'
import { includeHeader } from '../syntax/c++/includeNitroHeader.js'

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

  const namespace = NitroConfig.getCxxNamespace('c++', 'views')

  const properties = spec.properties.map(
    (p) => `CachedProp<${p.type.getCode('c++')}> ${escapeCppName(p.name)};`
  )
  const cases = spec.properties.map(
    (p) => `case hashString("${p.name}"): return true;`
  )
  const includes = spec.properties.flatMap((p) =>
    p.getRequiredImports().map((i) => includeHeader(i, true))
  )

  // .hpp code
  const shadowIndent = createIndentation(shadowNodeClassName.length)
  const componentHeaderCode = `
${createFileMetadataString(`${component}.hpp`)}

#pragma once

#if REACT_NATIVE_VERSION >= 78

#include <optional>
#include <NitroModules/NitroDefines.hpp>
#include <NitroModules/NitroHash.hpp>
#include <NitroModules/CachedProp.hpp>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/view/ViewProps.h>

${includes.join('\n')}

namespace ${namespace} {

  using namespace facebook;

  /**
   * The name of the actual native View.
   */
  extern const char ${nameVariable}[] = "${T}";

  /**
   * Props for the "${spec.name}" View.
   */
  class ${propsClassName} final: public react::ViewProps {
  public:
    ${propsClassName}() = default;
    ${propsClassName}(const ${propsClassName}&);
    ${propsClassName}(const react::PropsParserContext& context,
  ${createIndentation(propsClassName.length)}   const ${propsClassName}& sourceProps,
  ${createIndentation(propsClassName.length)}   const react::RawProps& rawProps);

  public:
    ${indent(properties.join('\n'), '    ')}

  private:
    static bool filterObjectKeys(const std::string& propName);
  };

  /**
   * State for the "${spec.name}" View.
   */
  class ${stateClassName} final {
  public:
    ${stateClassName}() = default;

  public:
    void setProps(${propsClassName}&& props) { _props.emplace(props); }
    const std::optional<${propsClassName}>& getProps() const { return _props; }

  private:
    std::optional<${propsClassName}> _props;
  };

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
  class ${descriptorClassName} final: public react::ConcreteComponentDescriptor<${shadowNodeClassName}> {
  public:
    ${descriptorClassName}(const react::ComponentDescriptorParameters& parameters);

  public:
    void adopt(react::ShadowNode& shadowNode) const override;
  };

  /* The actual view for "${spec.name}" needs to be implemented in platform-specific code. */

} // namespace ${namespace}

#else
  #warning "View Component '${HybridT}' will be unavailable in React Native, because it requires React Native 78 or higher."
#endif
`.trim()

  // .cpp code
  const propInitializers = [
    'react::ViewProps(context, sourceProps, rawProps, filterObjectKeys)',
  ]
  const propCopyInitializers = ['react::ViewProps()']
  for (const prop of spec.properties) {
    const name = escapeCppName(prop.name)
    const type = prop.type.getCode('c++')
    propInitializers.push(
      `
${name}([&]() -> CachedProp<${type}> {
  try {
    const react::RawValue* rawValue = rawProps.at("${prop.name}", nullptr, nullptr);
    if (rawValue == nullptr) return sourceProps.${name};
    const auto& [runtime, value] = (std::pair<jsi::Runtime*, const jsi::Value&>)*rawValue;
    return CachedProp<${type}>::fromRawValue(*runtime, value, sourceProps.${name});
  } catch (const std::exception& exc) {
    throw std::runtime_error(std::string("${spec.name}.${prop.name}: ") + exc.what());
  }
}())`.trim()
    )
    propCopyInitializers.push(`${name}(other.${name})`)
  }

  const ctorIndent = createIndentation(propsClassName.length * 2)
  const componentCode = `
${createFileMetadataString(`${component}.cpp`)}

#include "${component}.hpp"
#include <string>
#include <exception>
#include <utility>
#include <NitroModules/JSIConverter.hpp>
#include <react/renderer/core/RawValue.h>
#include <react/renderer/core/ShadowNode.h>
#include <react/renderer/core/ComponentDescriptor.h>
#include <react/renderer/components/view/ViewProps.h>

#if REACT_NATIVE_VERSION >= 78

namespace ${namespace} {

  ${propsClassName}::${propsClassName}(const react::PropsParserContext& context,
  ${ctorIndent}   const ${propsClassName}& sourceProps,
  ${ctorIndent}   const react::RawProps& rawProps):
    ${indent(propInitializers.join(',\n'), '    ')} { }

  ${propsClassName}::${propsClassName}(const ${propsClassName}& other):
    ${indent(propCopyInitializers.join(',\n'), '    ')} { }

  bool ${propsClassName}::filterObjectKeys(const std::string& propName) {
    switch (hashString(propName)) {
      ${indent(cases.join('\n'), '      ')}
      default: return false;
    }
  }

  ${descriptorClassName}::${descriptorClassName}(const react::ComponentDescriptorParameters& parameters)
    : ConcreteComponentDescriptor(parameters,
                                  std::make_unique<react::RawPropsParser>(/* enableJsiParser */ true)) {}

  void ${descriptorClassName}::adopt(react::ShadowNode& shadowNode) const {
    // This is called immediately after \`ShadowNode\` is created, cloned or in progress.
#ifdef ANDROID
    // On Android, we need to wrap props in our state, which gets routed through Java and later unwrapped in JNI/C++.
    auto& concreteShadowNode = static_cast<${shadowNodeClassName}&>(shadowNode);
    const ${propsClassName}& props = concreteShadowNode.getConcreteProps();
    ${stateClassName} state;
    state.setProps(props);
    concreteShadowNode.setStateData(std::move(state));
#else
    // On iOS, prop updating happens through the updateProps: Obj-C selector.
#endif
  }

} // namespace ${namespace}

#endif
`.trim()

  return [
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
}
