import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { includeHeader } from '../c++/includeNitroHeader.js'
import {
  createFileMetadataString,
  isNotDuplicate,
  toReferenceType,
} from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { FunctionType } from '../types/FunctionType.js'
import { addJNINativeRegistration } from './JNINativeRegistrations.js'
import { KotlinCxxBridgedType } from './KotlinCxxBridgedType.js'

export function createKotlinFunction(functionType: FunctionType): SourceFile[] {
  const name = functionType.specializationName
  const packageName = NitroConfig.getAndroidPackage('java/kotlin')
  const kotlinReturnType = functionType.returnType.getCode('kotlin')
  const kotlinParams = functionType.parameters.map(
    (p) => `${p.escapedName}: ${p.getCode('kotlin')}`
  )
  const lambdaSignature = `(${kotlinParams.join(', ')}) -> ${kotlinReturnType}`

  const kotlinCode = `
${createFileMetadataString(`${name}.kt`)}

package ${packageName}

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import dalvik.annotation.optimization.FastNative

/**
 * Represents the JavaScript callback \`${functionType.jsName}\`.
 * This is implemented in C++, via a \`std::function<...>\`.
 */
@DoNotStrip
@Keep
@Suppress("RedundantSuppression", "ConvertSecondaryConstructorToPrimary", "RedundantUnitReturnType", "KotlinJniMissingFunction", "ClassName", "unused")
class ${name} {
  @DoNotStrip
  @Keep
  private val mHybridData: HybridData

  @DoNotStrip
  @Keep
  private constructor(hybridData: HybridData) {
    mHybridData = hybridData
  }

  /**
   * Converts this function to a Kotlin Lambda.
   * This exists purely as syntactic sugar, and has minimal runtime overhead.
   */
  fun toLambda(): ${lambdaSignature} = this::call

  /**
   * Call the given JS callback.
   * @throws Throwable if the JS function itself throws an error, or if the JS function/runtime has already been deleted.
   */
  @FastNative
  external fun call(${kotlinParams.join(', ')}): ${kotlinReturnType}
}
  `.trim()

  const cppReturnType = functionType.returnType.getCode('c++')
  const jniRawParams = functionType.parameters.map((p) => {
    const bridge = new KotlinCxxBridgedType(p)
    const type = bridge.asJniReferenceType('alias')
    return `${type} ${p.escapedName}`
  })
  const jniParams = functionType.parameters.map((p) => {
    const bridge = new KotlinCxxBridgedType(p)
    const type = bridge.asJniReferenceType('global')
    return `const ${type}& ${p.escapedName}`
  })
  const jniParamsForward = functionType.parameters.map((p) => {
    const bridge = new KotlinCxxBridgedType(p)
    if (bridge.isJniReferenceType) {
      return `jni::make_global(${p.escapedName})`
    } else {
      return p.escapedName
    }
  })
  const jniClassDescriptor = NitroConfig.getAndroidPackage('c++/jni', name)
  const cxxNamespace = NitroConfig.getCxxNamespace('c++')
  const cppFunctionType = functionType.getCode('c++')

  const bridgedReturn = new KotlinCxxBridgedType(functionType.returnType)
  const bridgedParameters = functionType.parameters.map((p) => {
    const bridge = new KotlinCxxBridgedType(p)
    return `${bridge.asJniReferenceType('global')} /* ${p.name} */`
  })
  const jniFunctionType = `std::function<${bridgedReturn.asJniReferenceType('local')}(${bridgedParameters.join(', ')})>`

  const cppParams = functionType.parameters.map((p) => {
    if (p.canBePassedByReference) {
      return `${toReferenceType(p.getCode('c++'))} ${p.escapedName}`
    } else {
      return `${p.getCode('c++')} ${p.escapedName}`
    }
  })
  const cppToJniParamsForward = functionType.parameters.map((p) => {
    const bridge = new KotlinCxxBridgedType(p)
    const forward = bridge.parseFromCppToKotlin(p.escapedName, 'c++', false)
    if (bridge.isJniReferenceType) {
      return `jni::make_global(${forward})`
    } else {
      return forward
    }
  })
  let cppToJniForwardBody: string
  if (bridgedReturn.hasType) {
    // it returns some value
    cppToJniForwardBody = `
${bridgedReturn.asJniReferenceType('local')} result = javaFunc(${indent(cppToJniParamsForward.join(', '), '        ')});
return ${bridgedReturn.parseFromKotlinToCpp('result', 'kotlin')}
    `.trim()
  } else {
    // it returns void
    cppToJniForwardBody = `
javaFunc(${indent(cppToJniParamsForward.join(', '), '        ')});
    `.trim()
  }

  const jniToCppParamsForward = functionType.parameters.map((p) => {
    const bridge = new KotlinCxxBridgedType(p)
    return bridge.parseFromKotlinToCpp(p.escapedName, 'c++', false)
  })
  let jniToCppForwardBody: string
  if (bridgedReturn.hasType) {
    // it returns some value
    jniToCppForwardBody = `
${cppReturnType} result = func(${indent(jniToCppParamsForward.join(', '), '        ')});
return ${bridgedReturn.parseFromKotlinToCpp('result', 'kotlin')}
    `.trim()
  } else {
    // it returns void
    jniToCppForwardBody = `
func(${indent(jniToCppParamsForward.join(', '), '        ')});
    `.trim()
  }

  const bridged = new KotlinCxxBridgedType(functionType)
  const imports = bridged
    .getRequiredImports()
    .filter((i) => i.name !== `J${name}.hpp`)
  const includes = imports.map((i) => includeHeader(i)).filter(isNotDuplicate)

  const fbjniCode = `
${createFileMetadataString(`J${name}.hpp`)}

#pragma once

#include <fbjni/fbjni.h>
#include <functional>
#include <NitroModules/JSIConverter.hpp>

${includes.join('\n')}

namespace ${cxxNamespace} {

  using namespace facebook;

  /**
   * C++ representation of the callback ${name}.
   * This is a Kotlin \`${functionType.getCode('kotlin')}\`, backed by a \`std::function<...>\`.
   */
  struct J${name} final: public jni::HybridClass<J${name}> {
  public:
    static jni::local_ref<J${name}::javaobject> wrap(const ${jniFunctionType}& func) {
      return J${name}::newObjectCxxArgs(func);
    }
    static jni::local_ref<J${name}::javaobject> wrap(${jniFunctionType}&& func) {
      return J${name}::newObjectCxxArgs(std::move(func));
    }

    static jni::local_ref<J${name}::javaobject> fromCpp(const ${cppFunctionType}& func) {
      return wrap([func](${jniParams.join(', ')}) {
        ${indent(jniToCppForwardBody, '        ')}
      });
    }
    static jni::local_ref<J${name}::javaobject> fromCpp(${cppFunctionType}&& func) {
      return wrap([func = std::move(func)](${jniParams.join(', ')}) {
        ${indent(jniToCppForwardBody, '        ')}
      });
    }

  public:
    ${cppReturnType} call(${jniRawParams.join(', ')}) {
      return _func(${indent(jniParamsForward.join(', '), '      ')});
    }

  public:
    [[nodiscard]] inline const ${jniFunctionType}& getFunction() const noexcept {
      return _func;
    }

    /**
     * Convert this JNI-based function to a C++ function with proper type conversion.
     */
    [[nodiscard]] ${cppFunctionType} toCpp() const {
      ${jniFunctionType} javaFunc = _func;
      return [javaFunc](${cppParams.join(', ')}) {
        ${indent(cppToJniForwardBody, '        ')}
      };
    }

  public:
    static auto constexpr kJavaDescriptor = "L${jniClassDescriptor};";
    static void registerNatives() {
      registerHybrid({makeNativeMethod("call", J${name}::call)});
    }

  private:
    explicit J${name}(const ${jniFunctionType}& func): _func(func) { }
    explicit J${name}(${jniFunctionType}&& func): _func(std::move(func)) { }

  private:
    friend HybridBase;
    ${jniFunctionType} _func;
  };

} // namespace ${cxxNamespace}

namespace margelo::nitro {

  // (Args...) => T <> J${name}
  template <>
  struct JSIConverter<J${name}::javaobject> final {
    static inline jni::local_ref<J${name}::javaobject> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      return J${name}::wrap(JSIConverter<${jniFunctionType}>::fromJSI(runtime, arg));
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<J${name}::javaobject>& arg) {
      return JSIConverter<${jniFunctionType}>::toJSI(runtime, arg->cthis()->getFunction());
    }
    static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      return JSIConverter<${jniFunctionType}>::canConvert(runtime, value);
    }
  };

} // namespace margelo::nitro
  `.trim()

  // Make sure we register all native JNI methods on app startup
  addJNINativeRegistration({
    namespace: cxxNamespace,
    className: `J${name}`,
    import: {
      name: `J${name}.hpp`,
      space: 'user',
      language: 'c++',
    },
  })

  const files: SourceFile[] = []
  files.push({
    content: kotlinCode,
    language: 'kotlin',
    name: `${name}.kt`,
    subdirectory: NitroConfig.getAndroidPackageDirectory(),
    platform: 'android',
  })
  files.push({
    content: fbjniCode,
    language: 'c++',
    name: `J${name}.hpp`,
    subdirectory: [],
    platform: 'android',
  })
  return files
}
