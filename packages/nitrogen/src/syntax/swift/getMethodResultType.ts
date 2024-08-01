import type { HybridObjectName } from '../getHybridObjectName.js'
import type { Method } from '../Method.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

export interface MethodResult {
  typename: string
  hasType: boolean
  swiftEnumCode: string
  parseFromSwiftToCpp(cppName: string): string
}

export function getMethodResultType(
  hybridObjectName: HybridObjectName,
  method: Method
): MethodResult {
  const returnType = new SwiftCxxBridgedType(method.returnType)
  const name = `${hybridObjectName.HybridTSpecCxx}_${method.name}_Result`
  const hasType = method.returnType.kind !== 'void'

  const swiftMethodSignature = `${hybridObjectName.HybridTSpec}.${method.name}(${method.parameters.map((p) => `${p.name}:`).join(', ')})`

  return {
    typename: name,
    hasType: hasType,
    swiftEnumCode: `
/**
 * The exception-free result type for ${hybridObjectName.HybridTSpec}.${method.name}(...).
 * Original func:
 * \`\`\`swift
 * ${method.getCode('swift')}
 * \`\`\`
 * - seealso: \`${swiftMethodSignature}\`
 */
@frozen
public enum ${name} {
  case ${hasType ? `value(${returnType.getTypeCode('swift')})` : 'value'}
  case error(message: String)
}
    `.trim(),
    parseFromSwiftToCpp(cppName): string {
      return `
if (${cppName}.isError()) [[unlikely]] {
  throw std::runtime_error(${cppName}.getError());
}
${hasType ? `return ${cppName}.getValue();` : 'return;'}
      `.trim()
    },
  }
}
