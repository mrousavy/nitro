import { createFileMetadataString } from '../helpers.js'
import type { Method } from '../Method.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

export interface MethodResult {
  typename: string
  hasType: boolean
  swiftEnumCode: string
  parseFromSwiftToCpp(cppName: string): string
}

export function getMethodResultType(
  bridgeClassName: string,
  method: Method
): MethodResult {
  const returnType = new SwiftCxxBridgedType(method.returnType)
  const name = `${bridgeClassName}_${method.name}_Result`
  const hasType = method.returnType.kind !== 'void'

  return {
    typename: name,
    hasType: hasType,
    swiftEnumCode: `
${createFileMetadataString(`${name}.swift`)}

import NitroModules

/**
 * C++ does not support catching Swift errors yet, so we have to wrap
 * them in a Result type.
 * - .value means the function returned successfully (either a value, or void)
 * - .error means the function threw any Error. Only the message can be propagated
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
