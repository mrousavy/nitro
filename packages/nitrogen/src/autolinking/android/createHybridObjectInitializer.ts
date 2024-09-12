import { NitroConfig } from '../../config/NitroConfig.js'
import { createCppHybridObjectRegistration } from '../../syntax/c++/CppHybridObjectRegistration.js'
import { includeHeader } from '../../syntax/c++/includeNitroHeader.js'
import {
  createFileMetadataString,
  isNotDuplicate,
} from '../../syntax/helpers.js'
import { getJNINativeRegistrations } from '../../syntax/kotlin/JNINativeRegistrations.js'
import type { SourceFile, SourceImport } from '../../syntax/SourceFile.js'
import { indent } from '../../utils.js'

export function createHybridObjectIntializer(): SourceFile[] {
  const autolinkingClassName = `${NitroConfig.getIosModuleName()}OnLoad`

  const jniRegistrations = getJNINativeRegistrations().map(
    (r) => `${r.namespace}::${r.className}::registerNatives();`
  )

  const autolinkedHybridObjects = NitroConfig.getAutolinkedHybridObjects()

  const cppHybridObjectImports: SourceImport[] = []
  const cppRegistrations: string[] = []
  for (const hybridObjectName of Object.keys(autolinkedHybridObjects)) {
    const config = autolinkedHybridObjects[hybridObjectName]

    if (config?.cpp != null) {
      // Autolink a C++ HybridObject!
      const { cppCode, requiredImports } = createCppHybridObjectRegistration({
        hybridObjectName: hybridObjectName,
        cppClassName: config.cpp,
      })
      cppHybridObjectImports.push(...requiredImports)
      cppRegistrations.push(cppCode)
    }
  }

  const includes = [
    ...getJNINativeRegistrations().map((r) => includeHeader(r.import)),
    ...cppHybridObjectImports.map((i) => includeHeader(i)),
  ]
    .filter(isNotDuplicate)
    .join('\n')

  const cppCode = `
${createFileMetadataString(`${autolinkingClassName}.cpp`)}

#include <jni.h>
#include <fbjni/fbjni.h>
#include <NitroModules/HybridObjectRegistry.hpp>

${includes}

/**
 * Called when Java loads the native C++ library (\`System.loadLibrary("${NitroConfig.getAndroidCxxLibName()}")\`)
 */
JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  using namespace margelo::nitro;
  using namespace ${NitroConfig.getCxxNamespace('c++')};

  return facebook::jni::initialize(vm, [] {
    // Register native JNI methods
    ${indent(jniRegistrations.join('\n'), '    ')}

    // Register Nitro Hybrid Objects
    ${indent(cppRegistrations.join('\n'), '    ')}
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
