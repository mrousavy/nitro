import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { createFileMetadataString, toReferenceType } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { Type } from '../types/Type.js'
import type { VariantType } from '../types/VariantType.js'
import { KotlinCxxBridgedType } from './KotlinCxxBridgedType.js'

export function getVariantName(variant: VariantType): string {
  const variants = variant.variants.map((v) => v.getCode('kotlin'))
  return `Variant_` + variants.join('_')
}

function getVariantInnerName(variantType: Type): string {
  return `Some${variantType.getCode('kotlin')}`
}

export function createKotlinVariant(variant: VariantType): SourceFile[] {
  const jsName = variant.variants.map((v) => v.getCode('kotlin')).join('|')
  const kotlinName = getVariantName(variant)

  const innerClasses = variant.variants.map((v) => {
    const innerName = getVariantInnerName(v)
    return `
@DoNotStrip
data class ${innerName}(@DoNotStrip val value: ${v.getCode('kotlin')}): ${kotlinName}()
      `.trim()
  })

  const packageName = NitroConfig.getAndroidPackage('java/kotlin')
  const getterCases = variant.variants.map((v) => {
    const innerName = getVariantInnerName(v)
    return `is ${innerName} -> value as? T`
  })
  const isFunctions = variant.variants.map((v) => {
    const innerName = getVariantInnerName(v)
    return `
val is${v.getCode('kotlin')}: Boolean
  get() = this is ${innerName}
    `.trim()
  })

  const createFunctions = variant.variants.map((v) => {
    const innerName = getVariantInnerName(v)
    return `
@JvmStatic
@DoNotStrip
fun create(value: ${v.getCode('kotlin')}): ${kotlinName} = ${innerName}(value)
    `.trim()
  })
  const code = `
${createFileMetadataString(`${kotlinName}.kt`)}

package ${packageName}

import com.facebook.proguard.annotations.DoNotStrip

/**
 * Represents the TypeScript variant "${jsName}".
 */
@DoNotStrip
sealed class ${kotlinName} {
  ${indent(innerClasses.join('\n'), '  ')}

  inline fun <reified T> getAs(): T? = when (this) {
    ${indent(getterCases.join('\n'), '    ')}
  }

  ${indent(isFunctions.join('\n'), '  ')}

  companion object {
    ${indent(createFunctions.join('\n'), '    ')}
  }
}
  `.trim()

  const cxxNamespace = NitroConfig.getCxxNamespace('c++')
  const jniClassDescriptor = NitroConfig.getAndroidPackage(
    'c++/jni',
    kotlinName
  )
  const cppCreateFuncs = variant.variants.map((v) => {
    const bridge = new KotlinCxxBridgedType(v)
    return `
static jni::local_ref<J${kotlinName}> create(${bridge.asJniReferenceType('alias')} value) {
  static const auto method = javaClassStatic()->getStaticMethod<J${kotlinName}(${bridge.asJniReferenceType('alias')})>("create");
  return method(javaClassStatic(), value);
}
    `.trim()
  })
  const variantCases = variant.variants.map((v, i) => {
    const bridge = new KotlinCxxBridgedType(v)
    return `case ${i}: return create(${bridge.parseFromCppToKotlin(`std::get<${i}>(variant)`, 'c++')});`
  })
  const cppInnerClassesForwardDecl = variant.variants.map((v) => {
    const innerName = getVariantInnerName(v)
    return `class ${innerName};`
  })
  const cppGetIfs = variant.variants.map((v) => {
    const innerName = getVariantInnerName(v)
    const bridge = new KotlinCxxBridgedType(v)
    return `
if (isInstanceOf(${innerName}::javaClassStatic())) {
  auto jniValue = static_cast<${innerName}*>(this)->get();
  return ${bridge.parseFromKotlinToCpp('jniValue', 'c++')};
}
  `.trim()
  })
  const cppInnerClasses = variant.variants.map((v) => {
    const bridge = new KotlinCxxBridgedType(v)
    const innerName = getVariantInnerName(v)
    const descriptor = NitroConfig.getAndroidPackage(
      'c++/jni',
      `${kotlinName}$${innerName}`
    )
    return `
class ${innerName}: public jni::JavaClass<${innerName}, J${kotlinName}> {
public:
  static auto constexpr kJavaDescriptor = "L${descriptor};";

  ${bridge.asJniReferenceType('local')} get() {
    static const auto field = javaClassStatic()->getField<${bridge.getTypeCode('c++')}>("value");
    return getFieldValue(field);
  }
};
    `.trim()
  })
  const fbjniCode = `
${createFileMetadataString(`J${kotlinName}.hpp`)}

#pragma once

#include <fbjni/fbjni.h>
#include <variant>

namespace ${cxxNamespace} {

  using namespace facebook;

  ${indent(cppInnerClassesForwardDecl.join('\n'), '  ')}

  /**
   * The C++ JNI bridge between the C++ std::variant and the Java class "${kotlinName}".
   */
  class J${kotlinName}: public jni::JavaClass<J${kotlinName}> {
  public:
    static auto constexpr kJavaDescriptor = "L${jniClassDescriptor};";

    ${indent(cppCreateFuncs.join('\n'), '    ')}

    static jni::local_ref<J${kotlinName}> fromCpp(${toReferenceType(variant.getCode('c++'))} variant) {
      switch (variant.index()) {
        ${indent(variantCases.join('\n'), '        ')}
        default: throw std::invalid_argument("Variant holds unknown index! (" + std::to_string(variant.index()) + ")");
      }
    }

    ${variant.getCode('c++')} toCpp();
  };

  ${indent(cppInnerClasses.join('\n\n'), '  ')}

  ${variant.getCode('c++')} J${kotlinName}::toCpp() {
    ${indent(cppGetIfs.join(' else '), '    ')}
    throw std::invalid_argument("Variant is unknown Kotlin instance!");
  }

} // namespace ${cxxNamespace}
  `.trim()

  const files: SourceFile[] = []
  files.push({
    content: code,
    language: 'kotlin',
    name: `${kotlinName}.kt`,
    subdirectory: NitroConfig.getAndroidPackageDirectory(),
    platform: 'android',
  })
  files.push({
    content: fbjniCode,
    language: 'c++',
    name: `J${kotlinName}.hpp`,
    subdirectory: [],
    platform: 'android',
  })
  return files
}
