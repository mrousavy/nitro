import { NitroConfig } from '../../config/NitroConfig.js'
import { capitalizeName, indent } from '../../utils.js'
import { includeHeader } from '../c++/includeNitroHeader.js'
import { getReferencedTypes } from '../getReferencedTypes.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { StructType } from '../types/StructType.js'
import { KotlinCxxBridgedType } from './KotlinCxxBridgedType.js'

export function createKotlinStruct(structType: StructType): SourceFile[] {
  const packageName = NitroConfig.getAndroidPackage('java/kotlin')
  const values = structType.properties.map(
    (p) => `val ${p.escapedName}: ${p.getCode('kotlin')}`
  )
  let secondaryConstructor: string
  const needsSpecialHandling = structType.properties.some(
    (p) => new KotlinCxxBridgedType(p).needsSpecialHandling
  )
  if (needsSpecialHandling) {
    const params = structType.properties.map((p) => {
      const bridged = new KotlinCxxBridgedType(p)
      return `${p.escapedName}: ${bridged.getTypeCode('kotlin')}`
    })
    const paramsForward = structType.properties.map((p) => {
      const bridged = new KotlinCxxBridgedType(p)
      return bridged.parseFromCppToKotlin(p.escapedName, 'kotlin', false)
    })
    secondaryConstructor = `
@DoNotStrip
@Keep
private constructor(${indent(params.join(', '), 20)})
             : this(${indent(paramsForward.join(', '), 20)})
    `.trim()
  } else {
    secondaryConstructor = `/* main constructor */`
  }

  const code = `
${createFileMetadataString(`${structType.structName}.kt`)}

package ${packageName}

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.*

/**
 * Represents the JavaScript object/struct "${structType.structName}".
 */
@DoNotStrip
@Keep
data class ${structType.structName}(
  ${indent(values.join(',\n'), '  ')}
) {
  ${indent(secondaryConstructor, '  ')}
}
  `.trim()

  const cxxNamespace = NitroConfig.getCxxNamespace('c++')
  const jniClassDescriptor = NitroConfig.getAndroidPackage(
    'c++/jni',
    structType.structName
  )
  const jniStructInitializerBody = createJNIStructInitializer(structType)
  const cppStructInitializerBody = createCppStructInitializer(
    'value',
    structType
  )
  const imports = structType.properties
    .flatMap((p) => getReferencedTypes(p))
    .map((t) => new KotlinCxxBridgedType(t))
    .flatMap((t) => t.getRequiredImports())
  const includes = imports
    .map((i) => includeHeader(i))
    .filter(isNotDuplicate)
    .sort()

  const fbjniCode = `
${createFileMetadataString(`J${structType.structName}.hpp`)}

#pragma once

#include <fbjni/fbjni.h>
#include "${structType.declarationFile.name}"

${includes.join('\n')}

namespace ${cxxNamespace} {

  using namespace facebook;

  /**
   * The C++ JNI bridge between the C++ struct "${structType.structName}" and the the Kotlin data class "${structType.structName}".
   */
  struct J${structType.structName} final: public jni::JavaClass<J${structType.structName}> {
  public:
    static auto constexpr kJavaDescriptor = "L${jniClassDescriptor};";

  public:
    /**
     * Convert this Java/Kotlin-based struct to the C++ struct ${structType.structName} by copying all values to C++.
     */
    [[maybe_unused]]
    [[nodiscard]]
    ${structType.structName} toCpp() const {
      ${indent(jniStructInitializerBody, '      ')}
    }

  public:
    /**
     * Create a Java/Kotlin-based struct by copying all values from the given C++ struct to Java.
     */
    [[maybe_unused]]
    static jni::local_ref<J${structType.structName}::javaobject> fromCpp(const ${structType.structName}& value) {
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
    subdirectory: NitroConfig.getAndroidPackageDirectory(),
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
    const jniType = new KotlinCxxBridgedType(prop)
    const signatureType = jniType.getTypeCode('c++')
    const valueType = jniType.asJniReferenceType('local')
    lines.push(
      `static const auto ${fieldName} = clazz->getField<${signatureType}>("${prop.escapedName}");`
    )
    lines.push(
      `${valueType} ${prop.escapedName} = this->getFieldValue(${fieldName});`
    )
  }

  const propsForward = structType.properties.map((p) => {
    const bridged = new KotlinCxxBridgedType(p)
    return bridged.parse(p.escapedName, 'kotlin', 'c++', 'c++')
  })
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
  const names = structType.properties.map((p) => {
    const name = `${cppValueName}.${p.escapedName}`
    const bridge = new KotlinCxxBridgedType(p)
    return bridge.parse(name, 'c++', 'kotlin', 'c++')
  })
  lines.push(`  ${indent(names.join(',\n'), '  ')}`)
  lines.push(');')
  return lines.join('\n')
}
