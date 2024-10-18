import { NitroConfig } from '../../config/NitroConfig.js'
import { createCppHybridObjectRegistration } from '../../syntax/c++/CppHybridObjectRegistration.js'
import { includeHeader } from '../../syntax/c++/includeNitroHeader.js'
import {
  createFileMetadataString,
  isNotDuplicate,
} from '../../syntax/helpers.js'
import { getJNINativeRegistrations } from '../../syntax/kotlin/JNINativeRegistrations.js'
import { createJNIHybridObjectRegistration } from '../../syntax/kotlin/KotlinHybridObjectRegistration.js'
import type { SourceFile, SourceImport } from '../../syntax/SourceFile.js'
import { indent } from '../../utils.js'

export function createHybridObjectIntializer(): SourceFile[] {
  const cxxNamespace = NitroConfig.getCxxNamespace('c++')
  const autolinkingClassName = `${NitroConfig.getAndroidCxxLibName()}OnLoad`

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
    if (config?.kotlin != null) {
      // Autolink a Kotlin HybridObject through JNI/C++!
      const { cppCode, requiredImports } = createJNIHybridObjectRegistration({
        hybridObjectName: hybridObjectName,
        jniClassName: config.kotlin,
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

  const hppCode = `
${createFileMetadataString(`${autolinkingClassName}.hpp`)}

#include <jni.h>
#include <NitroModules/NitroDefines.hpp>

namespace ${cxxNamespace} {

  /**
   * Initializes the native (C++) part of ${NitroConfig.getAndroidCxxLibName()}, and autolinks all Hybrid Objects.
   * Call this in your \`JNI_OnLoad\` function (probably inside \`cpp-adapter.cpp\`).
   * Example:
   * \`\`\`cpp (cpp-adapter.cpp)
   * JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
   *   return ${cxxNamespace}::initialize(vm);
   * }
   * \`\`\`
   */
  int initialize(JavaVM* vm);

} // namespace ${cxxNamespace}

    `
  const cppCode = `
${createFileMetadataString(`${autolinkingClassName}.cpp`)}

#include "${autolinkingClassName}.hpp"

#include <jni.h>
#include <fbjni/fbjni.h>
#include <NitroModules/HybridObjectRegistry.hpp>

${includes}

namespace ${cxxNamespace} {

int initialize(JavaVM* vm) {
  using namespace margelo::nitro;
  using namespace ${cxxNamespace};
  using namespace facebook;

  return facebook::jni::initialize(vm, [] {
    // Register native JNI methods
    ${indent(jniRegistrations.join('\n'), '    ')}

    // Register Nitro Hybrid Objects
    ${indent(cppRegistrations.join('\n'), '    ')}
  });
}

} // namespace ${cxxNamespace}

  `.trim()

  return [
    {
      content: hppCode,
      language: 'c++',
      name: `${autolinkingClassName}.hpp`,
      platform: 'android',
      subdirectory: [],
    },
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
