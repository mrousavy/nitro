import { NitroConfig } from '../../config/NitroConfig.js'
import { indent } from '../../utils.js'
import { getAllTypes } from '../getAllTypes.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { Method } from '../Method.js'
import type { Property } from '../Property.js'
import type { SourceFile } from '../SourceFile.js'
import { JNIWrappedType } from '../types/JNIWrappedType.js'

export function createFbjniHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const name = getHybridObjectName(spec.name)
  const propertiesDecl = spec.properties
    .map((p) => p.getCode('c++', { override: true }))
    .join('\n')
  const methodsDecl = spec.methods
    .map((p) => p.getCode('c++', { override: true }))
    .join('\n')
  const jniClassDescriptor = NitroConfig.getAndroidPackage(
    'c++/jni',
    name.HybridTSpec
  )
  const cxxNamespace = NitroConfig.getCxxNamespace('c++')

  const cppHeaderCode = `
${createFileMetadataString(`${name.HybridTSpec}.hpp`)}

#pragma once

#include <NitroModules/JHybridObject.hpp>
#include <fbjni/fbjni.h>
#include "${name.HybridTSpec}.hpp"

namespace ${cxxNamespace} {

  using namespace facebook;

  class ${name.JHybridTSpec}: public jni::HybridClass<${name.JHybridTSpec}, JHybridObject>, public ${name.HybridTSpec} {
  public:
    static auto constexpr kJavaDescriptor = "${jniClassDescriptor}";
    static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis);
    static void registerNatives();

  private:
    // C++ constructor (called from Java via \`initHybrid()\`)
    explicit ${name.JHybridTSpec}(jni::alias_ref<jhybridobject> jThis) : HybridBase(jThis), _javaPart(jni::make_global(jThis)) {}

  public:
    size_t getExternalMemorySize() noexcept override;

  public:
    inline jni::global_ref<${name.JHybridTSpec}::javaobject>& getJavaPart() noexcept { return _javaPart; }

  public:
    // Properties
    ${indent(propertiesDecl, '    ')}

  public:
    // Methods
    ${indent(methodsDecl, '    ')}

  private:
    friend HybridBase;
    using HybridBase::HybridBase;
    jni::global_ref<${name.JHybridTSpec}::javaobject> _javaPart;
  };

} // namespace ${cxxNamespace}
  `.trim()

  const propertiesImpl = spec.properties
    .map((m) => getFbjniPropertyForwardImplementation(spec, m))
    .join('\n')
  const methodsImpl = spec.methods
    .map((m) => getFbjniMethodForwardImplementation(spec, m))
    .join('\n')
  const allTypes = getAllTypes(spec)
  const jniImports = allTypes
    .map((t) => new JNIWrappedType(t))
    .map((t) => t.requiredJNIImport)
    .filter((i) => i != null)
  const cppIncludes = jniImports
    .map((i) => `#include "${i.name}"`)
    .filter(isNotDuplicate)
  const cppForwardDeclarations = jniImports
    .map((i) => i.forwardDeclaration)
    .filter((d) => d != null)
    .filter(isNotDuplicate)

  const cppImplCode = `
${createFileMetadataString(`${name.JHybridTSpec}.cpp`)}

#include "${name.JHybridTSpec}.hpp"

${cppForwardDeclarations.join('\n')}

${cppIncludes.join('\n')}

namespace ${cxxNamespace} {

  jni::local_ref<${name.JHybridTSpec}::jhybriddata> ${name.JHybridTSpec}::initHybrid(jni::alias_ref<jhybridobject> jThis) {
    return makeCxxInstance(jThis);
  }

  void ${name.JHybridTSpec}::registerNatives() {
    registerHybrid({
      makeNativeMethod("initHybrid", ${name.JHybridTSpec}::initHybrid),
    });
  }

  size_t ${name.JHybridTSpec}::getExternalMemorySize() noexcept {
    static const auto method = _javaPart->getClass()->getMethod<jlong()>("getMemorySize");
    return method(_javaPart.get());
  }

  // Properties
  ${indent(propertiesImpl, '  ')}

  // Methods
  ${indent(methodsImpl, '  ')}

} // namespace ${cxxNamespace}
  `.trim()

  const files: SourceFile[] = []
  files.push({
    content: cppHeaderCode,
    language: 'c++',
    name: `${name.JHybridTSpec}.hpp`,
    subdirectory: [],
    platform: 'android',
  })
  files.push({
    content: cppImplCode,
    language: 'c++',
    name: `${name.JHybridTSpec}.cpp`,
    subdirectory: [],
    platform: 'android',
  })
  return files
}

function getFbjniMethodForwardImplementation(
  spec: HybridObjectSpec,
  method: Method
): string {
  const name = getHybridObjectName(spec.name)

  const returnJNI = new JNIWrappedType(method.returnType)
  const paramsJNI = method.parameters.map((p) => new JNIWrappedType(p.type))

  const returnType = returnJNI.getCode('c++')
  const paramsTypes = paramsJNI.map((p) => p.getCode('c++')).join(', ')
  const cxxSignature = `${returnType}(${paramsTypes})`

  const body = `
static const auto method = _javaPart->getClass()->getMethod<${cxxSignature}>("${method.name}");
throw std::runtime_error("${method.name}(...) is not yet implemented!");
  `.trim()
  const code = method.getCode(
    'c++',
    {
      classDefinitionName: name.JHybridTSpec,
    },
    body
  )
  return code
}

function getFbjniPropertyForwardImplementation(
  spec: HybridObjectSpec,
  property: Property
): string {
  const methods = property.cppMethods.map((m) =>
    getFbjniMethodForwardImplementation(spec, m)
  )

  return methods.join('\n')
}
