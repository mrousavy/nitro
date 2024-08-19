import { NitroConfig } from '../../config/NitroConfig.js'
import { createFileMetadataString, toReferenceType } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { FunctionType } from '../types/FunctionType.js'

export function createKotlinFunction(functionType: FunctionType): SourceFile[] {
  const name = functionType.specializationName
  const packageName = NitroConfig.getAndroidPackage('java/kotlin')
  const kotlinReturnType = functionType.returnType.getCode('kotlin')
  const kotlinParams = functionType.parameters.map(
    (p) => `${p.escapedName}: ${p.getCode('kotlin')}`
  )
  const lambdaTypename = `(${kotlinParams.join(', ')}) -> ${kotlinReturnType}`

  const kotlinCode = `
${createFileMetadataString(`${name}.kt`)}

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
class ${name} @DoNotStrip @Keep private constructor(hybridData: HybridData) {
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
  const jniClassDescriptor = NitroConfig.getAndroidPackage('c++/jni', name)
  const cxxNamespace = NitroConfig.getCxxNamespace('c++')
  const typename = functionType.getCode('c++')
  const fbjniCode = `
${createFileMetadataString(`J${name}.hpp`)}

#pragma once

#include <fbjni/fbjni.h>
#include <functional>

namespace ${cxxNamespace} {

  using namespace facebook;

  /**
   * C++ representation of the callback ${name}.
   * This is a Kotlin \`${lambdaTypename}\`, backed by a \`std::function<...>\`.
   */
  struct J${name}: public jni::HybridClass<J${name}> {
  public:
    static jni::local_ref<J${name}::javaobject> fromCpp(const ${typename}& func) {
      return J${name}::newObjectCxxArgs(func);
    }

  public:
    ${cppReturnType} call(${cppParams.join(', ')}) {
      return _func(${paramsForward.join(', ')});
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
