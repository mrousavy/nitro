import { NitroConfig } from '../../config/NitroConfig.js'
import { createFileMetadataString } from '../../syntax/helpers.js'
import type { SourceFile } from '../../syntax/SourceFile.js'

type ObjcFile = Omit<SourceFile, 'language'> & { language: 'objective-c++' }

export function createHybridObjectIntializer(): ObjcFile {
  const name = `${NitroConfig.getIosModuleName()}OnLoad`
  const filename = `${name}.mm`
  const umbrellaHeaderName = `${NitroConfig.getIosModuleName()}-Swift-Cxx-Umbrella.hpp`

  const code = `
${createFileMetadataString(filename)}

#import <Foundation/Foundation.h>
#import "${umbrellaHeaderName}"

@interface ${name} : NSObject
@end

@implementation ${name}

+ (void) load {
  // TODO: Register Hybrid Objects here!
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
