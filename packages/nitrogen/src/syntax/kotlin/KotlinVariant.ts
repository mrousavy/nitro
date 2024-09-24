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
data class ${innerName}(val value: ${v.getCode('kotlin')}): ${kotlinName}()
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
    return `
case ${i}:
  return create(${bridge.parseFromCppToKotlin(`std::get<${i}>(variant)`, 'c++')});
    `.trim()
  })
  const fbjniCode = `
${createFileMetadataString(`J${kotlinName}.hpp`)}

#pragma once

#include <fbjni/fbjni.h>
#include <variant>

namespace ${cxxNamespace} {

  using namespace facebook;

  /**
   * The C++ JNI bridge between the C++ std::variant and the Java class "${kotlinName}".
   */
  struct J${kotlinName} final: public jni::JavaClass<J${kotlinName}> {
  public:
    static auto constexpr kJavaDescriptor = "L${jniClassDescriptor};";

    ${indent(cppCreateFuncs.join('\n'), '    ')}

    static jni::local_ref<J${kotlinName}> create(${toReferenceType(variant.getCode('c++'))} variant) {
      switch (variant.index()) {
        ${indent(variantCases.join('\n'), '        ')}
        default:
          throw std::runtime_error("Variant holds unknown index! (" + std::to_string(variant.index()) + ")");
      }
    }
  };

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
