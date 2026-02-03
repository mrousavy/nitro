import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { includeHeader } from '../c++/includeNitroHeader.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import type { SourceFile } from '../SourceFile.js'
import type { FunctionType } from '../types/FunctionType.js'
import { addJNINativeRegistration } from './JNINativeRegistrations.js'
import {
  detectCyclicStructDependencies,
  partitionAndTransformImports,
} from './detectCyclicDependencies.js'
import { KotlinCxxBridgedType } from './KotlinCxxBridgedType.js'

export function createKotlinFunction(functionType: FunctionType): SourceFile[] {
  const name = functionType.specializationName
  const packageName = NitroConfig.current.getAndroidPackage('java/kotlin')
  const kotlinReturnType = functionType.returnType.getCode('kotlin')
  const kotlinParams = functionType.parameters.map(
    (p) => `${p.escapedName}: ${p.getCode('kotlin')}`
  )
  const kotlinParamTypes = functionType.parameters.map((p) =>
    p.getCode('kotlin')
  )
  const kotlinParamsForward = functionType.parameters.map((p) => p.escapedName)
  const lambdaSignature = `(${kotlinParamTypes.join(', ')}) -> ${kotlinReturnType}`

  const extraImports = functionType
    .getRequiredImports('kotlin')
    .map((i) => `import ${i.name}`)
    .filter(isNotDuplicate)

  const kotlinCode = `
${createFileMetadataString(`${name}.kt`)}

package ${packageName}

import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import dalvik.annotation.optimization.FastNative
${extraImports.join('\n')}

/**
 * Represents the JavaScript callback \`${functionType.jsName}\`.
 * This can be either implemented in C++ (in which case it might be a callback coming from JS),
 * or in Kotlin/Java (in which case it is a native callback).
 */
@DoNotStrip
@Keep
@Suppress("ClassName", "RedundantUnitReturnType")
fun interface ${name}: ${lambdaSignature} {
  /**
   * Call the given JS callback.
   * @throws Throwable if the JS function itself throws an error, or if the JS function/runtime has already been deleted.
   */
  @DoNotStrip
  @Keep
  override fun invoke(${kotlinParams.join(', ')}): ${kotlinReturnType}
}

/**
 * Represents the JavaScript callback \`${functionType.jsName}\`.
 * This is implemented in C++, via a \`std::function<...>\`.
 * The callback might be coming from JS.
 */
@DoNotStrip
@Keep
@Suppress(
  "KotlinJniMissingFunction", "unused",
  "RedundantSuppression", "RedundantUnitReturnType", "FunctionName",
  "ConvertSecondaryConstructorToPrimary", "ClassName", "LocalVariableName",
)
class ${name}_cxx: ${name} {
  @DoNotStrip
  @Keep
  private val mHybridData: HybridData

  @DoNotStrip
  @Keep
  private constructor(hybridData: HybridData) {
    mHybridData = hybridData
  }

  @DoNotStrip
  @Keep
  override fun invoke(${kotlinParams.join(', ')}): ${kotlinReturnType}
    = invoke_cxx(${kotlinParamsForward.join(',')})

  @FastNative
  private external fun invoke_cxx(${kotlinParams.join(', ')}): ${kotlinReturnType}
}

/**
 * Represents the JavaScript callback \`${functionType.jsName}\`.
 * This is implemented in Java/Kotlin, via a \`${lambdaSignature}\`.
 * The callback is always coming from native.
 */
@DoNotStrip
@Keep
@Suppress("ClassName", "RedundantUnitReturnType", "unused")
class ${name}_java(private val function: ${lambdaSignature}): ${name} {
  @DoNotStrip
  @Keep
  override fun invoke(${kotlinParams.join(', ')}): ${kotlinReturnType} {
    return this.function(${kotlinParamsForward.join(', ')})
  }
}
  `.trim()

  const jniInterfaceDescriptor = NitroConfig.current.getAndroidPackage(
    'c++/jni',
    name
  )
  const jniClassDescriptor = NitroConfig.current.getAndroidPackage(
    'c++/jni',
    `${name}_cxx`
  )
  const bridgedReturn = new KotlinCxxBridgedType(functionType.returnType)
  const cxxNamespace = NitroConfig.current.getCxxNamespace('c++')
  const typename = functionType.getCode('c++')

  // call() Java -> C++
  const cppParams = functionType.parameters.map((p) => {
    const bridge = new KotlinCxxBridgedType(p)
    const type = bridge.asJniReferenceType('alias')
    return `${type} ${p.escapedName}`
  })
  const paramsForward = functionType.parameters.map((p) => {
    const bridge = new KotlinCxxBridgedType(p)
    return bridge.parseFromKotlinToCpp(p.escapedName, 'c++', false)
  })

  // call() C++ -> Java
  const jniParams = functionType.parameters.map((p) => {
    if (p.canBePassedByReference) {
      return `const ${p.getCode('c++')}& ${p.escapedName}`
    } else {
      return `${p.getCode('c++')} ${p.escapedName}`
    }
  })
  const jniParamsForward = [
    'self()',
    ...functionType.parameters.map((p) => {
      const bridge = new KotlinCxxBridgedType(p)
      return bridge.parseFromCppToKotlin(p.escapedName, 'c++', false)
    }),
  ]
  const jniSignature = `${bridgedReturn.asJniReferenceType('local')}(${functionType.parameters
    .map((p) => {
      const bridge = new KotlinCxxBridgedType(p)
      return `${bridge.asJniReferenceType('alias')} /* ${p.escapedName} */`
    })
    .join(', ')})`

  let cppCallBody: string
  let jniCallBody: string
  if (functionType.returnType.kind === 'void') {
    // It returns void
    cppCallBody = `_func(${indent(paramsForward.join(', '), '      ')});`
    jniCallBody = `
static const auto method = javaClassStatic()->getMethod<${jniSignature}>("invoke");
method(${jniParamsForward.join(', ')});
    `.trim()
  } else {
    // It returns a type!
    cppCallBody = `
${functionType.returnType.getCode('c++')} __result = _func(${indent(paramsForward.join(', '), '      ')});
return ${bridgedReturn.parseFromCppToKotlin('__result', 'c++')};
`.trim()
    jniCallBody = `
static const auto method = javaClassStatic()->getMethod<${jniSignature}>("invoke");
auto __result = method(${jniParamsForward.join(', ')});
return ${bridgedReturn.parseFromKotlinToCpp('__result', 'c++', false)};
    `.trim()
  }

  const fbjniReturnType =
    functionType.returnType.kind === 'hybrid-object'
      ? bridgedReturn.asJniReferenceType('global')
      : bridgedReturn.asJniReferenceType('local')

  const bridged = new KotlinCxxBridgedType(functionType)
  const imports = bridged
    .getRequiredImports('c++')
    .filter((i) => i.name !== `J${name}.hpp`)

  // Detect cyclic struct references: structs that contain this function type
  // These structs' JNI headers (J<StructName>.hpp) would create circular includes
  const { cyclicNames: cyclicStructNames, hasCyclicDeps } =
    detectCyclicStructDependencies(functionType)

  // Partition imports into regular and cyclic includes in a single pass
  const { regularIncludes, cyclicIncludes } = partitionAndTransformImports(
    imports,
    cyclicStructNames,
    includeHeader
  )

  // Generate forward declarations for cyclic struct types
  const forwardDeclarations = Array.from(cyclicStructNames)
    .map((structName) => `struct J${structName};`)
    .join('\n  ')

  // Make sure we register all native JNI methods on app startup
  addJNINativeRegistration({
    namespace: cxxNamespace,
    className: `J${name}_cxx`,
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
    subdirectory: NitroConfig.current.getAndroidPackageDirectory(),
    platform: 'android',
  })

  if (hasCyclicDeps) {
    // For cyclic dependencies: header with declarations only, cpp with implementations
    const fbjniHeader = `
${createFileMetadataString(`J${name}.hpp`)}

#pragma once

#include <fbjni/fbjni.h>
#include <functional>

${regularIncludes.join('\n')}

namespace ${cxxNamespace} {

  using namespace facebook;

  // Forward declarations for cyclic dependencies
  ${forwardDeclarations}

  /**
   * Represents the Java/Kotlin callback \`${functionType.getCode('kotlin')}\`.
   * This can be passed around between C++ and Java/Kotlin.
   */
  struct J${name}: public jni::JavaClass<J${name}> {
  public:
    static auto constexpr kJavaDescriptor = "L${jniInterfaceDescriptor};";

  public:
    /**
     * Invokes the function this \`J${name}\` instance holds through JNI.
     */
    ${functionType.returnType.getCode('c++')} invoke(${jniParams.join(', ')}) const;
  };

  /**
   * An implementation of ${name} that is backed by a C++ implementation (using \`std::function<...>\`)
   */
  class J${name}_cxx final: public jni::HybridClass<J${name}_cxx, J${name}> {
  public:
    static jni::local_ref<J${name}::javaobject> fromCpp(const ${typename}& func);

  public:
    /**
     * Invokes the C++ \`std::function<...>\` this \`J${name}_cxx\` instance holds.
     */
    ${fbjniReturnType} invoke_cxx(${cppParams.join(', ')});

  public:
    [[nodiscard]]
    inline const ${typename}& getFunction() const {
      return _func;
    }

  public:
    static auto constexpr kJavaDescriptor = "L${jniClassDescriptor};";
    static void registerNatives();

  private:
    explicit J${name}_cxx(const ${typename}& func): _func(func) { }

  private:
    friend HybridBase;
    ${typename} _func;
  };

} // namespace ${cxxNamespace}
    `.trim()

    const fbjniCpp = `
${createFileMetadataString(`J${name}.cpp`)}

#include "J${name}.hpp"

// Include cyclic dependencies in the .cpp file where all types are complete
${cyclicIncludes.join('\n')}

namespace ${cxxNamespace} {

  ${functionType.returnType.getCode('c++')} J${name}::invoke(${jniParams.join(', ')}) const {
    ${indent(jniCallBody, '    ')}
  }

  jni::local_ref<J${name}::javaobject> J${name}_cxx::fromCpp(const ${typename}& func) {
    return J${name}_cxx::newObjectCxxArgs(func);
  }

  ${fbjniReturnType} J${name}_cxx::invoke_cxx(${cppParams.join(', ')}) {
    ${indent(cppCallBody, '    ')}
  }

  void J${name}_cxx::registerNatives() {
    registerHybrid({makeNativeMethod("invoke_cxx", J${name}_cxx::invoke_cxx)});
  }

} // namespace ${cxxNamespace}
    `.trim()

    files.push({
      content: fbjniHeader,
      language: 'c++',
      name: `J${name}.hpp`,
      subdirectory: [],
      platform: 'android',
    })
    files.push({
      content: fbjniCpp,
      language: 'c++',
      name: `J${name}.cpp`,
      subdirectory: [],
      platform: 'android',
    })
  } else {
    // No cyclic dependencies - use the original inline header-only code
    const allIncludes = imports.map((i) => includeHeader(i)).filter(isNotDuplicate)

    const fbjniCode = `
${createFileMetadataString(`J${name}.hpp`)}

#pragma once

#include <fbjni/fbjni.h>
#include <functional>

${allIncludes.join('\n')}

namespace ${cxxNamespace} {

  using namespace facebook;

  /**
   * Represents the Java/Kotlin callback \`${functionType.getCode('kotlin')}\`.
   * This can be passed around between C++ and Java/Kotlin.
   */
  struct J${name}: public jni::JavaClass<J${name}> {
  public:
    static auto constexpr kJavaDescriptor = "L${jniInterfaceDescriptor};";

  public:
    /**
     * Invokes the function this \`J${name}\` instance holds through JNI.
     */
    ${functionType.returnType.getCode('c++')} invoke(${jniParams.join(', ')}) const {
      ${indent(jniCallBody, '      ')}
    }
  };

  /**
   * An implementation of ${name} that is backed by a C++ implementation (using \`std::function<...>\`)
   */
  class J${name}_cxx final: public jni::HybridClass<J${name}_cxx, J${name}> {
  public:
    static jni::local_ref<J${name}::javaobject> fromCpp(const ${typename}& func) {
      return J${name}_cxx::newObjectCxxArgs(func);
    }

  public:
    /**
     * Invokes the C++ \`std::function<...>\` this \`J${name}_cxx\` instance holds.
     */
    ${fbjniReturnType} invoke_cxx(${cppParams.join(', ')}) {
      ${indent(cppCallBody, '      ')}
    }

  public:
    [[nodiscard]]
    inline const ${typename}& getFunction() const {
      return _func;
    }

  public:
    static auto constexpr kJavaDescriptor = "L${jniClassDescriptor};";
    static void registerNatives() {
      registerHybrid({makeNativeMethod("invoke_cxx", J${name}_cxx::invoke_cxx)});
    }

  private:
    explicit J${name}_cxx(const ${typename}& func): _func(func) { }

  private:
    friend HybridBase;
    ${typename} _func;
  };

} // namespace ${cxxNamespace}
    `.trim()

    files.push({
      content: fbjniCode,
      language: 'c++',
      name: `J${name}.hpp`,
      subdirectory: [],
      platform: 'android',
    })
  }

  return files
}
