import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { includeHeader } from '../c++/includeNitroHeader.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { FunctionType } from '../types/FunctionType.js'
import { isArrayOfPrimitives, isPrimitive } from './KotlinBoxedPrimitive.js'
import { KotlinCxxBridgedType } from './KotlinCxxBridgedType.js'

function isFunctionPurelyPrimitive(func: FunctionType): boolean {
  if (!isPrimitive(func.returnType) && !isArrayOfPrimitives(func.returnType)) {
    // return type is not primitive (or array of primitives)
    return false
  }
  return func.parameters.every((p) => isPrimitive(p) || isArrayOfPrimitives(p))
}

export function createKotlinFunction(functionType: FunctionType): SourceFile[] {
  const name = functionType.specializationName
  const packageName = NitroConfig.getAndroidPackage('java/kotlin')
  const kotlinReturnType = functionType.returnType.getCode('kotlin')
  const kotlinParams = functionType.parameters.map(
    (p) => `${p.escapedName}: ${p.getCode('kotlin')}`
  )
  const isPurelyPrimitive = isFunctionPurelyPrimitive(functionType)
  const annotation = isPurelyPrimitive ? 'CriticalNative' : 'FastNative'
  const lambdaSignature = `(${kotlinParams.join(', ')}) -> ${kotlinReturnType}`

  const kotlinCode = `
${createFileMetadataString(`${name}.kt`)}

package ${packageName}

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import dalvik.annotation.optimization.${annotation}

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
  @${annotation}
  external fun call(${kotlinParams.join(', ')}): ${kotlinReturnType}
}
  `.trim()

  const cppReturnType = functionType.returnType.getCode('c++')
  const cppParams = functionType.parameters.map((p) => {
    const bridge = new KotlinCxxBridgedType(p)
    const type = bridge.asJniReferenceType('alias')
    return `const ${type}& ${p.escapedName}`
  })
  const paramsForward = functionType.parameters.map((p) => {
    const bridge = new KotlinCxxBridgedType(p)
    return bridge.parseFromKotlinToCpp(p.escapedName, 'c++', false)
  })
  const jniClassDescriptor = NitroConfig.getAndroidPackage('c++/jni', name)
  const cxxNamespace = NitroConfig.getCxxNamespace('c++')
  const typename = functionType.getCode('c++')

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

${includes.join('\n')}

namespace ${cxxNamespace} {

  using namespace facebook;

  /**
   * C++ representation of the callback ${name}.
   * This is a Kotlin \`${functionType.getCode('kotlin')}\`, backed by a \`std::function<...>\`.
   */
  struct J${name} final: public jni::HybridClass<J${name}> {
  public:
    static jni::local_ref<J${name}::javaobject> fromCpp(const ${typename}& func) {
      return J${name}::newObjectCxxArgs(func);
    }

  public:
    ${cppReturnType} call(${cppParams.join(', ')}) {
      return _func(${indent(paramsForward.join(', '), '      ')});
    }

  public:
    static auto constexpr kJavaDescriptor = "${jniClassDescriptor}";
    static void registerNatives() {
      registerHybrid({makeNativeMethod("call", J${name}::call)});
    }

  private:
    explicit J${name}(const ${typename}& func): _func(func) { }

  private:
    friend HybridBase;
    ${typename} _func;
  };

} // namespace ${cxxNamespace}
  `.trim()

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
