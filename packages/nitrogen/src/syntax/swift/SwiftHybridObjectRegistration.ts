import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import type { SourceImport } from '../SourceFile.js'
import { HybridObjectType } from '../types/HybridObjectType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

interface Props {
  /**
   * The name of the Hybrid Object under which it should be registered and exposed to JS to.
   */
  hybridObjectName: string
  /**
   * The name of the Swift class that will be default-constructed
   */
  swiftClassName: string
}

interface SwiftHybridObjectRegistration {
  cppCode: string
  swiftRegistrationClass: string
  requiredImports: SourceImport[]
}

export function getAutolinkingNamespace() {
  const swiftNamespace = NitroConfig.current.getIosModuleName()
  const autolinkingClassName = `${swiftNamespace}Autolinking`
  return `${swiftNamespace}::${autolinkingClassName}`
}

export function getHybridObjectConstructorCall(
  hybridObjectName: string
): string {
  const namespace = getAutolinkingNamespace()
  return `${namespace}::create${hybridObjectName}();`
}

export function createSwiftHybridObjectRegistration({
  hybridObjectName,
  swiftClassName,
}: Props): SwiftHybridObjectRegistration {
  const { HybridTSpecSwift } = getHybridObjectName(hybridObjectName)

  const type = new HybridObjectType(
    hybridObjectName,
    'swift',
    [],
    NitroConfig.current
  )
  const bridge = new SwiftCxxBridgedType(type)

  return {
    swiftRegistrationClass: `
public static func create${hybridObjectName}() -> ${bridge.getTypeCode('swift')} {
  let hybridObject = ${swiftClassName}()
  return ${indent(bridge.parseFromSwiftToCpp('hybridObject', 'swift'), '    ')}
}
public static var is${hybridObjectName}RecyclableHybridView: Bool {
  return ${swiftClassName}.self is any RecyclableView.Type
}
    `.trim(),
    requiredImports: [
      { name: `${HybridTSpecSwift}.hpp`, language: 'c++', space: 'user' },
    ],
    cppCode: `
HybridObjectRegistry::registerHybridObjectConstructor(
  "${hybridObjectName}",
  []() -> std::shared_ptr<HybridObject> {
    auto swiftHybridObject = ${getHybridObjectConstructorCall(hybridObjectName)}
    return swiftHybridObject.getCxxPart();
  }
);
      `.trim(),
  }
}
