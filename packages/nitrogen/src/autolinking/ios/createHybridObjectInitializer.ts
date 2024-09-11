import { NitroConfig } from '../../config/NitroConfig.js'
import { getAllKnownHybridObjects } from '../../HybridObjectRegistry.js'
import { getHybridObjectName } from '../../syntax/getHybridObjectName.js'
import { createFileMetadataString } from '../../syntax/helpers.js'
import type { SourceFile } from '../../syntax/SourceFile.js'
import { indent } from '../../utils.js'

type ObjcFile = Omit<SourceFile, 'language'> & { language: 'objective-c++' }

export function createHybridObjectIntializer(): ObjcFile {
  const name = `${NitroConfig.getIosModuleName()}OnLoad`
  const filename = `${name}.mm`
  const umbrellaHeaderName = `${NitroConfig.getIosModuleName()}-Swift-Cxx-Umbrella.hpp`
  const cppHybridObjects = getAllKnownHybridObjects().filter(
    (h) => h.language === 'c++'
  )
  const swiftHybridObjects = getAllKnownHybridObjects().filter(
    (h) => h.language === 'swift'
  )

  const cppRegistrations = cppHybridObjects.map((h) => {
    return `
HybridObjectRegistry::registerHybridObjectConstructor(
  "${h.name}",
  []() -> std::shared_ptr<HybridObject> {
    return std::make_shared<${h.name}>();
  }
);
      `.trim()
  })
  const swiftRegistrations = swiftHybridObjects.map((h) => {
    const hybridObjectName = getHybridObjectName(h.name)
    const swiftNamespace = NitroConfig.getIosModuleName()
    return `
HybridObjectRegistry::registerHybridObjectConstructor(
  "${h.name}",
  []() -> std::shared_ptr<HybridObject> {
    auto swiftPart = ${swiftNamespace}::${hybridObjectName.HybridTSpecCxx}::init();
    return std::make_shared<${hybridObjectName.HybridTSpecSwift}>(swiftPart);
  }
);
      `.trim()
  })

  const code = `
${createFileMetadataString(filename)}

#import <Foundation/Foundation.h>
#import <NitroModules/HybridObjectRegistry.hpp>
#import "${umbrellaHeaderName}"

@interface ${name} : NSObject
@end

@implementation ${name}

+ (void) load {
  using namespace margelo::nitro;
  using namespace ${NitroConfig.getCxxNamespace('c++')};

  ${indent(cppRegistrations.join('\n'), '  ')}
  ${indent(swiftRegistrations.join('\n'), '  ')}
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
