import { NitroConfig } from '../../config/NitroConfig.js'
import { capitalizeName, indent } from '../../utils.js'
import { createFileMetadataString } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import { EnumType } from '../types/EnumType.js'

export function createKotlinEnum(enumType: EnumType): SourceFile[] {
  const members = enumType.enumMembers.map((m) => m.name.toUpperCase())
  const jniName = `J${enumType.enumName}`
  const packageName = NitroConfig.getAndroidPackage('java/kotlin')
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

  const cxxNamespace = NitroConfig.getCxxNamespace('c++')
  const jniClassDescriptor = NitroConfig.getAndroidPackage(
    'c++/jni',
    enumType.enumName
  )
  const cppToJniConverterCode = getCppToJniConverterCode('value', enumType)

  const fbjniCode = `
${createFileMetadataString(`${jniName}.hpp`)}

#pragma once

#include <fbjni/fbjni.h>
#include "${enumType.declarationFile.name}"
#include <NitroModules/JSIConverter.hpp>

namespace ${cxxNamespace} {

  using namespace facebook;

  /**
   * The C++ JNI bridge between the C++ enum "${enumType.enumName}" and the the Kotlin enum "${enumType.enumName}".
   */
  struct ${jniName} final: public jni::JavaClass<${jniName}> {
  public:
    static auto constexpr kJavaDescriptor = "L${jniClassDescriptor};";

  public:
    /**
     * Convert this Java/Kotlin-based enum to the C++ enum ${enumType.enumName}.
     */
    [[maybe_unused]]
    [[nodiscard]] ${enumType.enumName} toCpp() const {
      static const auto clazz = javaClassStatic();
      static const auto fieldOrdinal = clazz->getField<int>("ordinal");
      int ordinal = this->getFieldValue(fieldOrdinal);
      return static_cast<${enumType.enumName}>(ordinal);
    }

  public:
    /**
     * Create a Java/Kotlin-based enum with the given C++ enum's value.
     */
    [[maybe_unused]]
    static jni::local_ref<${jniName}> fromCpp(${enumType.enumName} value) {
      ${indent(cppToJniConverterCode, '      ')}
    }
  };

} // namespace ${cxxNamespace}


namespace margelo::nitro {

  using namespace ${cxxNamespace};

  // C++/JNI ${jniName} <> JS ${enumType.enumName}
  template <>
  struct JSIConverter<${jniName}> {
    static inline jni::local_ref<${jniName}> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      ${enumType.enumName} cppValue = JSIConverter<${enumType.enumName}>::fromJSI(runtime, arg);
      return ${jniName}::fromCpp(cppValue);
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<${jniName}>& arg) {
      ${enumType.enumName} cppValue = arg->toCpp();
      return JSIConverter<${enumType.enumName}>::toJSI(runtime, cppValue);
    }
    static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      return JSIConverter<${enumType.enumName}>::canConvert(runtime, value);
    }
  };

} // namespace margelo::nitro
  `.trim()

  const files: SourceFile[] = []
  files.push({
    content: code,
    language: 'kotlin',
    name: `${enumType.enumName}.kt`,
    subdirectory: NitroConfig.getAndroidPackageDirectory(),
    platform: 'android',
  })
  files.push({
    content: fbjniCode,
    language: 'c++',
    name: `${jniName}.hpp`,
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
  return jni::make_local(clazz->getStaticFieldValue(${fieldName}));
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
