import {
  getAndroidPackage,
  getAndroidPackageDirectory,
  getCxxNamespace,
} from '../../options.js'
import { indent } from '../../stringUtils.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
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

  const cxxNamespace = getCxxNamespace('c++')
  const jniClassDescriptor = getAndroidPackage('c++/jni', structType.structName)
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
     * Create a Java/Kotlin-based struct by copying all values from the given C++ struct to Java.
     */
    static J${structType.structName} create(const ${structType.structName}& value);

  public:
    /**
     * Convert this Java/Kotlin-based struct to the C++ struct ${structType.structName} by copying all values to C++.
     */
    ${structType.structName} to${structType.structName}();
  };

} // namespace ${cxxNamespace}
  `.trim()

  const files: SourceFile[] = []
  files.push({
    content: code,
    language: 'kotlin',
    name: `${structType.structName}.kt`,
    subdirectory: getAndroidPackageDirectory(),
    platform: 'android',
  })
  files.push({
    content: fbjniCode,
    language: 'c++',
    name: `${structType.structName}.hpp`,
    subdirectory: [],
    platform: 'android',
  })
  return files
}
