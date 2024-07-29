import {
  getAndroidPackage,
  getAndroidPackageDirectory,
  getCxxNamespace,
} from '../../options.js'
import { createFileMetadataString, toReferenceType } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { FunctionType } from '../types/FunctionType.js'

export function createKotlinFunction(
  packageName: string,
  functionType: FunctionType
): SourceFile[] {
  const specialization = functionType.specialization
  const specializationName = specialization.typename
  const kotlinReturnType = functionType.returnType.getCode('kotlin')
  const kotlinParams = functionType.parameters.map(
    (p) => `${p.escapedName}: ${p.getCode('kotlin')}`
  )
  const lambdaTypename = `(${kotlinParams.join(', ')}) -> ${kotlinReturnType}`

  const kotlinCode = `
${createFileMetadataString(`${specializationName}.kt`)}

package ${packageName}

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

/**
 * Represents the JavaScript callback "${lambdaTypename}".
 * This is implemented in C++, via a \`std::function<...>\`.
 */
@DoNotStrip
@Keep
@Suppress("KotlinJniMissingFunction")
class ${specializationName} @DoNotStrip @Keep private constructor(hybridData: HybridData) {
  @DoNotStrip
  @Keep
  private val mHybridData: HybridData

  init {
    mHybridData = hybridData
  }

  /**
   * Call the given JS callback.
   * @throws Throwable if the JS function itself throws an error, or if the JS function/runtime has already been deleted.
   */
  external fun call(${kotlinParams.join(', ')}): ${kotlinReturnType}
}
  `.trim()

  functionType.getCode
  const cppReturnType = functionType.returnType.getCode('c++')
  const cppParams = functionType.parameters.map((p) => {
    let type = p.getCode('c++')
    if (p.canBePassedByReference) {
      type = toReferenceType(type)
    }
    return `${type} ${p.escapedName}`
  })
  const paramsForward = functionType.parameters.map((p) => p.name)
  const jniClassDescriptor = getAndroidPackage('c++/jni', specializationName)
  const cxxNamespace = getCxxNamespace('c++')
  const fbjniCode = `
${createFileMetadataString(`J${specializationName}.hpp`)}

#pragma once

#include <fbjni/fbjni.h>
#include "${specialization.declarationFile.name}"

namespace ${cxxNamespace} {

  using namespace facebook;

  /**
   * C++ representation of the callback ${specializationName}.
   * This is a Kotlin \`${lambdaTypename}\`, backed by a \`std::function<...>\`.
   */
  struct J${specializationName}: public jni::HybridClass<J${specializationName}> {
  public:
    static jni::local_ref<J${specializationName}::javaobject> create(const ${specializationName}& func) {
      return J${specializationName}::newObjectCxxArgs(func);
    }

  public:
    ${cppReturnType} call(${cppParams.join(', ')}) {
      return _func(${paramsForward.join(', ')});
    }

  public:
    static auto constexpr kJavaDescriptor = "${jniClassDescriptor}";
    static void registerNatives() {
      registerHybrid({makeNativeMethod("call", J${specializationName}::call)});
    }

  private:
    explicit J${specializationName}(const ${specializationName}& func): _func(func) { }

  private:
    friend HybridBase;
    ${specializationName} _func;
  };

} // namespace ${cxxNamespace}
  `.trim()

  const files: SourceFile[] = []
  files.push({
    content: kotlinCode,
    language: 'kotlin',
    name: `${specializationName}.kt`,
    subdirectory: getAndroidPackageDirectory(),
    platform: 'android',
  })
  files.push({
    content: fbjniCode,
    language: 'c++',
    name: `J${specializationName}.hpp`,
    subdirectory: [],
    platform: 'android',
  })
  return files
}
