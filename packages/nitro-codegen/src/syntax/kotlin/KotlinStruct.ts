import { CONFIG } from '../../config/NitroConfig.js'
import { capitalizeName, indent } from '../../stringUtils.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import { JNIWrappedType } from '../types/JNIWrappedType.js'
import type { StructType } from '../types/StructType.js'

export function createKotlinStruct(
  packageName: string,
  structType: StructType
): SourceFile[] {
  const values = structType.properties.map(
    (p) => `val ${p.escapedName}: ${p.getCode('kotlin')}`
  )
  const code = `
${createFileMetadataString(`${structType.structName}.kt`)}

package ${packageName}

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

/**
 * Represents the JavaScript object/struct "${structType.structName}".
 */
@DoNotStrip
@Keep
data class ${structType.structName}(
  ${indent(values.join(',\n'), '  ')}
)
  `.trim()

  const cxxNamespace = CONFIG.getCxxNamespace('c++')
  const jniClassDescriptor = CONFIG.getAndroidPackage(
    'c++/jni',
    structType.structName
  )
  const jniStructInitializerBody = createJNIStructInitializer(structType)
  const cppStructInitializerBody = createCppStructInitializer(
    'value',
    structType
  )
  const fbjniCode = `
${createFileMetadataString(`J${structType.structName}.hpp`)}

#pragma once

#include <fbjni/fbjni.h>
#include "${structType.declarationFile.name}"

namespace ${cxxNamespace} {

  using namespace facebook;

  /**
   * The C++ JNI bridge between the C++ struct "${structType.structName}" and the the Kotlin data class "${structType.structName}".
   */
  struct J${structType.structName}: public jni::JavaClass<J${structType.structName}> {
  public:
    static auto constexpr kJavaDescriptor = "${jniClassDescriptor}";

  public:
    /**
     * Convert this Java/Kotlin-based struct to the C++ struct ${structType.structName} by copying all values to C++.
     */
    ${structType.structName} to${structType.structName}() {
      ${indent(jniStructInitializerBody, '      ')}
    }

  public:
    /**
     * Create a Java/Kotlin-based struct by copying all values from the given C++ struct to Java.
     */
    static jni::local_ref<J${structType.structName}::javaobject> create(const ${structType.structName}& value) {
      ${indent(cppStructInitializerBody, '      ')}
    }
  };

} // namespace ${cxxNamespace}
  `.trim()

  const files: SourceFile[] = []
  files.push({
    content: code,
    language: 'kotlin',
    name: `${structType.structName}.kt`,
    subdirectory: CONFIG.getAndroidPackageDirectory(),
    platform: 'android',
  })
  files.push({
    content: fbjniCode,
    language: 'c++',
    name: `J${structType.structName}.hpp`,
    subdirectory: [],
    platform: 'android',
  })
  return files
}

function createJNIStructInitializer(structType: StructType): string {
  const lines: string[] = ['static const auto clazz = javaClassStatic();']
  for (const prop of structType.properties) {
    const fieldName = `field${capitalizeName(prop.escapedName)}`
    const jniType = new JNIWrappedType(prop)
    const type = jniType.getCode('c++')
    lines.push(
      `static const auto ${fieldName} = clazz->getField<${type}>("${prop.escapedName}");`
    )
    lines.push(
      `${type} ${prop.escapedName} = this->getFieldValue(${fieldName});`
    )
  }

  const propsForward = structType.properties.map((p) => p.escapedName)
  // TODO: Properly convert C++ -> JNI (::javaobject)
  lines.push(`return ${structType.structName}(`)
  lines.push(`  ${indent(propsForward.join(',\n'), '  ')}`)
  lines.push(`);`)
  return lines.join('\n')
}

function createCppStructInitializer(
  cppValueName: string,
  structType: StructType
): string {
  const lines: string[] = []
  lines.push(`return newInstance(`)
  const names = structType.properties.map(
    (p) => `${cppValueName}.${p.escapedName}`
  )
  lines.push(`  ${indent(names.join(',\n'), '  ')}`)
  lines.push(');')
  return lines.join('\n')
}
