import { CONFIG } from '../../config/NitroConfig.js'
import {
  createFileMetadataString,
  escapeCppName,
  isNotDuplicate,
  toReferenceType,
} from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { FunctionType } from '../types/FunctionType.js'

export interface FunctionSpecialization {
  typename: string
  declarationFile: SourceFile
}

export function createCppFunctionSpecialization(
  func: FunctionType
): FunctionSpecialization {
  const returnType = func.returnType.getCode('c++')
  const paramsEscaped = func.parameters
    .map((p) => escapeCppName(p.getCode('c++')))
    .join('_')
  let typename = `Func_${escapeCppName(returnType)}`
  if (paramsEscaped.length > 0) {
    typename += `_${paramsEscaped}`
  }

  const extraImports = [
    ...func.returnType.getRequiredImports(),
    ...func.parameters.flatMap((p) => p.getRequiredImports()),
  ]
  const extraIncludes = extraImports
    .map((i) => `#include "${i.name}"`)
    .join('\n')
  const extraForwardDeclarations = extraImports
    .map((i) => i.forwardDeclaration)
    .filter((i) => i != null)
    .filter(isNotDuplicate)
    .join('\n')

  const paramsJs = func.parameters
    .map((p) => `${p.name}: ${p.getCode('c++')}`)
    .join(', ')
  const paramsCpp = func.parameters
    .map((p) => {
      let type = p.getCode('c++')
      if (p.canBePassedByReference) {
        type = toReferenceType(type)
      }
      return `${type} /* ${p.name} */`
    })
    .join(', ')
  const cxxNamespace = CONFIG.getCxxNamespace('c++')

  const code = `
${createFileMetadataString(typename)}

#include <functional>
#include <string>
#include <future>

${extraForwardDeclarations}

${extraIncludes}

namespace ${cxxNamespace} {

  /**
   * A \`(${paramsJs}) => ${returnType}\` function.
   */
  using ${typename} = std::function<${returnType}(${paramsCpp})>;

} // namespace ${cxxNamespace}
  `

  return {
    typename: typename,
    declarationFile: {
      content: code.trim(),
      language: 'c++',
      subdirectory: [],
      name: `${typename}.hpp`,
      platform: 'shared',
    },
  }
}
