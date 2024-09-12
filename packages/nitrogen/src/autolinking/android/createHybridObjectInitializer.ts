import { NitroConfig } from '../../config/NitroConfig.js'
import { createFileMetadataString } from '../../syntax/helpers.js'
import type { SourceFile } from '../../syntax/SourceFile.js'

export function createHybridObjectIntializer(): SourceFile[] {
  const autolinkingClassName = `${NitroConfig.getIosModuleName()}OnLoad`

  const cppCode = `
${createFileMetadataString(`${autolinkingClassName}.cpp`)}

#include <jni.h>
#include <fbjni/fbjni.h>

#include "JFunc_void_Person.hpp"
#include "JFunc_void_std__string.hpp"
#include "JHybridImageFactorySpec.hpp"
#include "JHybridImageSpec.hpp"
#include "JHybridKotlinTestObjectSpec.hpp"

#include "HybridTestObject.hpp"
#include <NitroModules/HybridObjectRegistry.hpp>

using namespace margelo::nitro::image;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
return facebook::jni::initialize(vm, [] {
  // TODO: Register JNI natives here

  // TODO: Register C++ turbo modules here
});
}

  `.trim()

  return [
    {
      content: cppCode,
      language: 'c++',
      name: `${autolinkingClassName}.cpp`,
      platform: 'android',
      subdirectory: [],
    },
    {
      content: '',
      language: 'kotlin',
      name: `${autolinkingClassName}.kt`,
      platform: 'android',
      subdirectory: [],
    },
  ]
}
