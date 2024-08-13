import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import {
  createFileMetadataString,
  isNotDuplicate,
  toReferenceType,
} from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { FunctionType } from '../types/FunctionType.js'
import { SwiftCxxBridgedType } from './SwiftCxxBridgedType.js'

export interface FunctionSpecialization {
  typename: string
  declarationFile: SourceFile
}

export function createSwiftCallback(
  funcType: FunctionType
): FunctionSpecialization {
  const moduleName = NitroConfig.getIosModuleName()
  const typename = `Callback_${funcType.specializationName}`

  const extraImports = [
    ...funcType.returnType.getRequiredImports(),
    ...funcType.parameters.flatMap((p) => p.getRequiredImports()),
  ]
  const extraIncludes = extraImports
    .map((i) => `#include "${i.name}"`)
    .join('\n')
  const extraForwardDeclarations = extraImports
    .map((i) => i.forwardDeclaration)
    .filter((i) => i != null)
    .filter(isNotDuplicate)
    .join('\n')

  const cxxNamespace = NitroConfig.getCxxNamespace('c++')

  const bridgedReturn = new SwiftCxxBridgedType(funcType.returnType)
  const bridgedReturnCode = bridgedReturn.getTypeCode('c++')
  const bridgedParamsSignature = funcType.parameters
    .map((p) => {
      const bridged = new SwiftCxxBridgedType(p)
      const type = bridged.getTypeCode('c++')
      return `${p.canBePassedByReference ? toReferenceType(type) : type} ${p.escapedName}`
    })
    .join(', ')
  const bridgedParamsForward = funcType.parameters
    .map((p) => {
      const bridged = new SwiftCxxBridgedType(p)
      return bridged.parseFromSwiftToCpp(p.escapedName, 'c++')
    })
    .join(', ')

  let body: string
  if (bridgedReturn.hasType) {
    // return type
    body = `
auto result = _func(${bridgedParamsForward});
return ${bridgedReturn.parseFromCppToSwift('result', 'c++')};
      `.trim()
  } else {
    // returns just void
    body = `_func(${bridgedParamsForward});`
  }

  const code = `
${createFileMetadataString(typename)}

#pragma once

#include <functional>
#include <string>
#include <future>

${extraForwardDeclarations}

${extraIncludes}

#include "${moduleName}-Swift-Cxx-Umbrella.hpp"

namespace ${cxxNamespace} {

  /**
   * A \`${funcType.jsName}\` function.
   */
  struct Callback {
  public:
    using FuncType = ${funcType.getCode('c++')};

  public:
    explicit Callback(FuncType&& func): _func(func) { }

  public:
    inline ${bridgedReturnCode} call(${bridgedParamsSignature}) const {
      ${indent(body, '      ')}
    }

  private:
    FuncType _func;
  };

} // namespace ${cxxNamespace}
  `

  return {
    typename: typename,
    declarationFile: {
      content: code.trim(),
      language: 'c++',
      subdirectory: [],
      name: `${typename}.hpp`,
      platform: 'ios',
    },
  }
}
