import { NitroConfig } from '../../config/NitroConfig.js'
import { capitalizeName, indent } from '../../utils.js'
import { includeHeader } from '../c++/includeNitroHeader.js'
import { getReferencedTypes } from '../getReferencedTypes.js'
import {
  createFileMetadataString,
  isNotDuplicate,
  toReferenceType,
} from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { StructType } from '../types/StructType.js'
import type { NamedType } from '../types/Type.js'
import { KotlinCxxBridgedType } from './KotlinCxxBridgedType.js'

export function createKotlinStruct(structType: StructType): SourceFile[] {
  const packageName = NitroConfig.getAndroidPackage('java/kotlin')
  const jniName = `J${structType.structName}`
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
  const jniPropertiesGetters = structType.properties
    .map((p) => createJNIPropertyGetter(p))
    .join('\n\n')
  const imports = structType.properties
    .flatMap((p) => getReferencedTypes(p))
    .map((t) => new KotlinCxxBridgedType(t))
    .flatMap((t) => t.getRequiredImports())
  const includes = imports
    .map((i) => includeHeader(i))
    .filter(isNotDuplicate)
    .sort()

  const ctorIndent = jniName.length + 47
  const jniParametersSignature = structType.properties.map((p) => {
    const bridge = new KotlinCxxBridgedType(p)
    if (bridge.canBePassedByReference) {
      return `${toReferenceType(bridge.asJniReferenceType('alias'))} ${p.escapedName}`
    } else {
      return `${bridge.asJniReferenceType('alias')} ${p.escapedName}`
    }
  })
  const paramsForward = structType.properties.map((p) => p.escapedName)
  const fromJsiConverters = structType.properties.map((p) => {
    const bridge = new KotlinCxxBridgedType(p)
    return `JSIConverter<${bridge.getTypeCode('c++')}>::fromJSI(runtime, obj.getProperty(runtime, "${p.name}"))`
  })
  const toJsiConverters = structType.properties.map((p) => {
    const bridge = new KotlinCxxBridgedType(p)
    const converter = `JSIConverter<${bridge.getTypeCode('c++')}>::toJSI(runtime, arg->get${capitalizeName(p.escapedName)}())`
    return `obj.setProperty(runtime, "${p.name}", ${converter});`
  })
  const canJsiConverters = structType.properties.map((p) => {
    const bridge = new KotlinCxxBridgedType(p)
    const canConvert = `JSIConverter<${bridge.getTypeCode('c++')}>::canConvert(runtime, obj.getProperty(runtime, "${p.name}"))`
    return `if (!${canConvert}) return false;`
  })

  const fbjniCode = `
${createFileMetadataString(`${jniName}.hpp`)}

#pragma once

#include <fbjni/fbjni.h>
#include "${structType.declarationFile.name}"
#include <NitroModules/JSIConverter.hpp>
#include <NitroModules/JSIConverter+JNI.hpp>

${includes.join('\n')}

namespace ${cxxNamespace} {

  using namespace facebook;

  /**
   * The C++ JNI bridge between the C++ struct "${structType.structName}" and the the Kotlin data class "${structType.structName}".
   */
  struct ${jniName} final: public jni::JavaClass<${jniName}> {
  public:
    static auto constexpr kJavaDescriptor = "L${jniClassDescriptor};";

  public:
    /**
     * Create a Java/Kotlin-based struct by copying all values from the given C++ struct to Java.
     */
    [[maybe_unused]]
    static jni::local_ref<${jniName}::javaobject> fromCpp(const ${structType.structName}& value) {
      ${indent(cppStructInitializerBody, '      ')}
    }

    /**
     * Create a Java/Kotlin-based struct from the given Java values.
     */
    static jni::local_ref<${jniName}::javaobject> create(${indent(jniParametersSignature.join(',\n'), ctorIndent)}) {
      return newInstance(
        ${indent(paramsForward.join(',\n'), '        ')}
      );
    }

  public:
    /**
     * Convert this Java/Kotlin-based struct to the C++ struct ${structType.structName} by copying all values to C++.
     */
    [[maybe_unused]]
    [[nodiscard]] ${structType.structName} toCpp() const {
      ${indent(jniStructInitializerBody, '      ')}
    }

  public:
    ${indent(jniPropertiesGetters, '    ')}
  };

} // namespace ${cxxNamespace}

namespace margelo::nitro {

  using namespace ${cxxNamespace};

  // C++/JNI ${jniName} <> JS ${structType.structName} (object)
  template <>
  struct JSIConverter<${jniName}> {
    static inline jni::local_ref<${jniName}> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      jsi::Object obj = arg.asObject(runtime);
      return ${jniName}::create(
        ${indent(fromJsiConverters.join(',\n'), '        ')}
      );
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<${jniName}>& arg) {
      jsi::Object obj(runtime);
      ${indent(toJsiConverters.join('\n'), '      ')}
      return obj;
    }
    static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      if (!value.isObject()) {
        return false;
      }
      jsi::Object obj = value.getObject(runtime);
      ${indent(canJsiConverters.join('\n'), '      ')}
      return true;
    }
  };

} // namespace margelo::nitro
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

function createJNIPropertyGetter(property: NamedType): string {
  const bridge = new KotlinCxxBridgedType(property)
  return `
[[nodiscard]] ${bridge.asJniReferenceType('local')} get${capitalizeName(property.escapedName)}() const {
  static const auto field = javaClassStatic()->getField<${bridge.getTypeCode('c++')}>("${property.escapedName}");
  return this->getFieldValue(field);
}
  `.trim()
}
