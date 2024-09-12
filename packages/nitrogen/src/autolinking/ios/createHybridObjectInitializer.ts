import { NitroConfig } from '../../config/NitroConfig.js'
import { getHybridObjectName } from '../../syntax/getHybridObjectName.js'
import { createFileMetadataString } from '../../syntax/helpers.js'
import type { SourceFile } from '../../syntax/SourceFile.js'
import { indent } from '../../utils.js'

type ObjcFile = Omit<SourceFile, 'language'> & { language: 'objective-c++' }

export function createHybridObjectIntializer(): ObjcFile {
  const name = `${NitroConfig.getIosModuleName()}OnLoad`
  const filename = `${name}.mm`
  const umbrellaHeaderName = `${NitroConfig.getIosModuleName()}-Swift-Cxx-Umbrella.hpp`

  const autolinkedHybridObjects = NitroConfig.getAutolinkedHybridObjects()

  const cppRegistrations: string[] = []
  const cppIncludes: string[] = []
  let containsSwiftObjects = false
  for (const hybridObjectName of Object.keys(autolinkedHybridObjects)) {
    const config = autolinkedHybridObjects[hybridObjectName]

    if (config?.cpp != null) {
      // Autolink a C++ HybridObject!
      const hybridObjectClassName = config.cpp
      cppIncludes.push(`${hybridObjectClassName}.hpp`)
      cppRegistrations.push(
        `
HybridObjectRegistry::registerHybridObjectConstructor(
  "${hybridObjectName}",
  []() -> std::shared_ptr<HybridObject> {
    static_assert(std::is_default_constructible_v<${hybridObjectClassName}>, "The HybridObject \\"${hybridObjectClassName}\\" is not default-constructible! Create a public constructor that takes zero arguments to be able to autolink this HybridObject.");
    return std::make_shared<${hybridObjectClassName}>();
  }
);
      `.trim()
      )
    }
    if (config?.swift != null) {
      // Autolink a Swift HybridObject!
      containsSwiftObjects = true
      const swiftNamespace = NitroConfig.getIosModuleName()
      const { HybridTSpecCxx, HybridTSpecSwift } =
        getHybridObjectName(hybridObjectName)
      cppIncludes.push(`${HybridTSpecSwift}.hpp`)
      cppRegistrations.push(
        `
HybridObjectRegistry::registerHybridObjectConstructor(
  "${hybridObjectName}",
  []() -> std::shared_ptr<HybridObject> {
    auto swiftPart = ${swiftNamespace}::${HybridTSpecCxx}::init();
    return std::make_shared<${HybridTSpecSwift}>(swiftPart);
  }
);
      `.trim()
      )
    }
  }

  const umbrellaImport = containsSwiftObjects
    ? `#import "${umbrellaHeaderName}"`
    : ''

  const code = `
${createFileMetadataString(filename)}

#import <Foundation/Foundation.h>
#import <NitroModules/HybridObjectRegistry.hpp>
${umbrellaImport}
#import <type_traits>

@interface ${name} : NSObject
@end

@implementation ${name}

+ (void) load {
  using namespace margelo::nitro;
  using namespace ${NitroConfig.getCxxNamespace('c++')};

  ${indent(cppRegistrations.join('\n'), '  ')}
}

@end
  `.trim()

  return {
    content: code,
    language: 'objective-c++',
    name: filename,
    platform: 'ios',
    subdirectory: [],
  }
}
