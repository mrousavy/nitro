import { NitroConfig } from '../../config/NitroConfig.js'
import { createCppHybridObjectRegistration } from '../../syntax/c++/CppHybridObjectRegistration.js'
import { includeHeader } from '../../syntax/c++/includeNitroHeader.js'
import { createFileMetadataString } from '../../syntax/helpers.js'
import type { SourceFile, SourceImport } from '../../syntax/SourceFile.js'
import { createSwiftHybridObjectRegistration } from '../../syntax/swift/SwiftHybridObjectRegistration.js'
import { indent } from '../../utils.js'

type ObjcFile = Omit<SourceFile, 'language'> & { language: 'objective-c++' }
type SwiftFile = Omit<SourceFile, 'language'> & { language: 'swift' }

export function createHybridObjectIntializer(): [ObjcFile, SwiftFile] {
  const autolinkingClassName = `${NitroConfig.getIosModuleName()}Autolinking`
  const umbrellaHeaderName = `${NitroConfig.getIosModuleName()}-Swift-Cxx-Umbrella.hpp`

  const autolinkedHybridObjects = NitroConfig.getAutolinkedHybridObjects()

  const swiftFunctions: string[] = []
  const cppRegistrations: string[] = []
  const cppImports: SourceImport[] = []
  let containsSwiftObjects = false
  for (const hybridObjectName of Object.keys(autolinkedHybridObjects)) {
    const config = autolinkedHybridObjects[hybridObjectName]

    if (config?.cpp != null) {
      // Autolink a C++ HybridObject!
      const { cppCode, requiredImports } = createCppHybridObjectRegistration({
        hybridObjectName: hybridObjectName,
        cppClassName: config.cpp,
      })
      cppImports.push(...requiredImports)
      cppRegistrations.push(cppCode)
    }
    if (config?.swift != null) {
      // Autolink a Swift HybridObject!
      containsSwiftObjects = true
      const { cppCode, requiredImports, swiftFunction } =
        createSwiftHybridObjectRegistration({
          hybridObjectName: hybridObjectName,
          swiftClassName: config.swift,
        })
      cppImports.push(...requiredImports)
      cppRegistrations.push(cppCode)
      swiftFunctions.push(swiftFunction)
    }
  }

  const umbrellaImport = containsSwiftObjects
    ? `#import "${umbrellaHeaderName}"`
    : ''
  const imports = cppImports.map((i) => includeHeader(i, true)).join('\n')

  const objcCode = `
${createFileMetadataString(`${autolinkingClassName}.mm`)}

#import <Foundation/Foundation.h>
#import <NitroModules/HybridObjectRegistry.hpp>
${umbrellaImport}
#import <type_traits>

${imports}

@interface ${autolinkingClassName} : NSObject
@end

@implementation ${autolinkingClassName}

+ (void) load {
  using namespace margelo::nitro;
  using namespace ${NitroConfig.getCxxNamespace('c++')};

  ${indent(cppRegistrations.join('\n'), '  ')}
}

@end
  `.trim()

  const swiftCode = `
${createFileMetadataString(`${autolinkingClassName}.swift`)}

public final class ${autolinkingClassName} {
  ${indent(swiftFunctions.join('\n\n'), '  ')}
}
  `.trim()

  return [
    {
      content: objcCode,
      language: 'objective-c++',
      name: `${autolinkingClassName}.mm`,
      platform: 'ios',
      subdirectory: [],
    },
    {
      content: swiftCode,
      language: 'swift',
      name: `${autolinkingClassName}.swift`,
      platform: 'ios',
      subdirectory: [],
    },
  ]
}
