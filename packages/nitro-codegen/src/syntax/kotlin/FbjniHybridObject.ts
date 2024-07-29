import { getAndroidPackage, getCxxNamespace } from '../../options.js'
import { indent } from '../../stringUtils.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { createFileMetadataString } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { Method } from '../Method.js'
import type { Property } from '../Property.js'
import type { SourceFile } from '../SourceFile.js'

export function createFbjniHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const name = getHybridObjectName(spec.name)
  const propertiesDecl = spec.properties
    .map((p) => p.getCode('c++', { override: true }))
    .join('\n')
  const methodsDecl = spec.methods
    .map((p) => p.getCode('c++', { override: true }))
    .join('\n')
  const jniClassDescriptor = getAndroidPackage('c++/jni', name.TSpec)
  const cxxNamespace = getCxxNamespace('c++')

  const cppHeaderCode = `
${createFileMetadataString(`${name.JTSpec}.hpp`)}

#include "${name.HybridT}.hpp"
#include <fbjni/fbjni.h>

namespace ${cxxNamespace} {

  using namespace facebook;

  class ${name.JTSpec}: public jni::HybridClass<${name.JTSpec}>, public ${name.HybridT} {
  public:
    static auto constexpr kJavaDescriptor = "${jniClassDescriptor}";
    static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis);
    static void registerNatives();

  private:
    // C++ constructor (called from Java via \`initHybrid()\`)
    explicit ${name.JTSpec}(jni::alias_ref<jhybridobject> jThis) : _javaPart(jni::make_global(jThis)) {}

  public:
    size_t getExternalMemorySize() noexcept override;

  public:
    // Properties
    ${indent(propertiesDecl, '    ')}

  public:
    // Methods
    ${indent(methodsDecl, '    ')}

  private:
    friend HybridBase;
    jni::global_ref<${name.JTSpec}::javaobject> _javaPart;
  };

} // namespace ${cxxNamespace}
  `.trim()

  const propertiesImpl = spec.properties
    .map((m) => getFbjniPropertyForwardImplementation(spec, m))
    .join('\n')
  const methodsImpl = spec.methods
    .map((m) => getFbjniMethodForwardImplementation(spec, m))
    .join('\n')

  const cppImplCode = `
${createFileMetadataString(`${name.JTSpec}.cpp`)}

#include "${name.JTSpec}.hpp"

jni::local_ref<${name.JTSpec}::jhybriddata> ${name.JTSpec}::initHybrid(jni::alias_ref<jhybridobject> jThis) {
  return makeCxxInstance(jThis);
}

void ${name.JTSpec}::registerNatives() {
  registerHybrid({
    makeNativeMethod("initHybrid", ${name.JTSpec}::initHybrid),
  });
}

size_t ${name.JTSpec}::getExternalMemorySize() {
  static const auto method = _javaPart->getClass()->getMethod<long()>("getMemorySize");
  return method(_javaPart.get());
}

// Properties
${propertiesImpl}

// Methods
${methodsImpl}
  `.trim()

  const files: SourceFile[] = []
  files.push({
    content: cppHeaderCode,
    language: 'c++',
    name: `${name.JTSpec}.hpp`,
    subdirectory: [],
    platform: 'android',
  })
  files.push({
    content: cppImplCode,
    language: 'c++',
    name: `${name.JTSpec}.cpp`,
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

  const returnType = method.returnType.getCode('c++')
  const paramsTypes = method.parameters
    .map((p) => p.type.getCode('c++'))
    .join(', ')
  const cxxSignature = `${returnType}(${paramsTypes})`

  const hasParams = method.parameters.length > 0
  const paramsForward = method.parameters.map((p) => p.name).join(', ')

  const body = `
static const auto method = _javaPart->getClass()->getMethod<${cxxSignature}>("${method.name}");
return method(${hasParams ? `_javaPart.get(), ${paramsForward}` : '_javaPart.get()'});
  `.trim()
  const code = method.getCode(
    'c++',
    {
      override: true,
      classDefinitionName: name.JTSpec,
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
