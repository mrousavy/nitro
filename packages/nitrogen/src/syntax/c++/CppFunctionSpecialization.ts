import { NitroConfig } from '../../config/NitroConfig.js'
import {
  createFileMetadataString,
  escapeCppName,
  isNotDuplicate,
  toReferenceType,
} from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { NamedType, Type } from '../types/Type.js'

export interface FunctionSpecialization {
  typename: string
  declarationFile: SourceFile
}

export function createCppFunctionSpecialization(
  returnType: Type,
  parameters: NamedType[]
): FunctionSpecialization {
  const returnTypeCode = returnType.getCode('c++')
  const typename =
    'Func_' +
    [returnType, ...parameters]
      .map((p) => escapeCppName(p.getCode('c++')))
      .join('_')

  const extraImports = [
    ...returnType.getRequiredImports(),
    ...parameters.flatMap((p) => p.getRequiredImports()),
  ]
  const extraIncludes = extraImports
    .map((i) => `#include "${i.name}"`)
    .join('\n')
  const extraForwardDeclarations = extraImports
    .map((i) => i.forwardDeclaration)
    .filter((i) => i != null)
    .filter(isNotDuplicate)
    .join('\n')

  const paramsJs = parameters
    .map((p) => `${p.name}: ${p.getCode('c++')}`)
    .join(', ')
  const paramsCpp = parameters
    .map((p) => {
      let type = p.getCode('c++')
      if (p.canBePassedByReference) {
        type = toReferenceType(type)
      }
      return `${type} /* ${p.name} */`
    })
    .join(', ')
  const cxxNamespace = NitroConfig.getCxxNamespace('c++')

  const code = `
${createFileMetadataString(typename)}

#include <functional>
#include <string>
#include <future>

${extraForwardDeclarations}

${extraIncludes}

namespace ${cxxNamespace} {

  /**
   * A \`(${paramsJs}) => ${returnTypeCode}\` function.
   */
  using ${typename} = std::function<${returnTypeCode}(${paramsCpp})>;

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
