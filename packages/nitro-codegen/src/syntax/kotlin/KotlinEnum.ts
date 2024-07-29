import {
  getAndroidPackage,
  getAndroidPackageDirectory,
  getCxxNamespace,
} from '../../options.js'
import { capitalizeName, indent } from '../../stringUtils.js'
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
  const cppToJniConverterCode = getCppToJniConverterCode('value', enumType)

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
     * Convert this Java/Kotlin-based enum to the C++ enum ${enumType.enumName}.
     */
    ${enumType.enumName} to${enumType.enumName}() {
      static const auto clazz = javaClassStatic();
      static const auto fieldOrdinal = clazz->getField<int>("ordinal");
      int ordinal = this->getFieldValue(fieldOrdinal);
      return static_cast<${enumType.enumName}>(ordinal);
    }

  public:
    /**
     * Create a Java/Kotlin-based enum with the given C++ enum's value.
     */
    static jni::alias_ref<J${enumType.enumName}> create(${enumType.enumName} value) {
      ${indent(cppToJniConverterCode, '      ')}
    }
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
    name: `J${enumType.enumName}.hpp`,
    subdirectory: [],
    platform: 'android',
  })
  return files
}

function getCppToJniConverterCode(
  cppValueName: string,
  enumType: EnumType
): string {
  const jniEnumName = `J${enumType.enumName}`

  const fields = enumType.enumMembers.map((m) => {
    const fieldName = `field${capitalizeName(m.name)}`
    return `static const auto ${fieldName} = clazz->getStaticField<${jniEnumName}>("${m.name}");`
  })

  const cases = enumType.enumMembers.map((m) => {
    const fieldName = `field${capitalizeName(m.name)}`
    return `
case ${enumType.enumName}::${m.name}:
  return clazz->getStaticFieldValue(${fieldName});
`.trim()
  })

  return `
static const auto clazz = javaClassStatic();
${fields.join('\n')}

switch (${cppValueName}) {
  ${indent(cases.join('\n'), '  ')}
  default:
    std::string stringValue = std::to_string(static_cast<int>(${cppValueName}));
    throw std::runtime_error("Invalid enum value (" + stringValue + "!");
}
  `.trim()
}
