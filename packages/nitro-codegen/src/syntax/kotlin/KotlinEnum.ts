import {
  getAndroidPackage,
  getAndroidPackageDirectory,
  getCxxNamespace,
} from '../../options.js'
import { indent } from '../../stringUtils.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import { EnumType } from '../types/EnumType.js'

export function createKotlinEnum(
  packageName: string,
  enumType: EnumType
): SourceFile[] {
  const members = enumType.enumMembers.map((m) => m.name.toUpperCase())
  const code = `
${createFileMetadataString(`${enumType.enumName}.kt`)}

package ${packageName}

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

/**
 * Represents the JavaScript enum/union "${enumType.enumName}".
 */
@DoNotStrip
@Keep
enum class ${enumType.enumName} {
  ${indent(members.join(',\n'), '  ')}
}
  `.trim()

  const cxxNamespace = getCxxNamespace('c++')
  const jniClassDescriptor = getAndroidPackage('c++/jni', enumType.enumName)
  const fbjniCode = `
${createFileMetadataString(`J${enumType.enumName}.hpp`)}

#pragma once

#include <fbjni/fbjni.h>
#include "${enumType.declarationFile.name}"

namespace ${cxxNamespace} {

  using namespace facebook;

  /**
   * The C++ JNI bridge between the C++ enum "${enumType.enumName}" and the the Kotlin enum "${enumType.enumName}".
   */
  struct J${enumType.enumName}: public jni::JavaClass<J${enumType.enumName}> {
  public:
    static auto constexpr kJavaDescriptor = "${jniClassDescriptor}";

  public:
    /**
     * Create a Java/Kotlin-based enum with the given C++ enum's value.
     */
    static J${enumType.enumName} create(${enumType.enumName} value);

  public:
    /**
     * Convert this Java/Kotlin-based enum to the C++ enum ${enumType.enumName}.
     */
    ${enumType.enumName} to${enumType.enumName}();
  };

} // namespace ${cxxNamespace}
  `.trim()

  const files: SourceFile[] = []
  files.push({
    content: code,
    language: 'kotlin',
    name: `${enumType.enumName}.kt`,
    subdirectory: getAndroidPackageDirectory(),
    platform: 'android',
  })
  files.push({
    content: fbjniCode,
    language: 'c++',
    name: `${enumType.enumName}.hpp`,
    subdirectory: [],
    platform: 'android',
  })
  return files
}
