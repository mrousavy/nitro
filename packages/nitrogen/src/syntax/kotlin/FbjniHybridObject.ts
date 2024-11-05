import { NitroConfig } from '../../config/NitroConfig.js'
import { createIndentation, indent } from '../../utils.js'
import { getForwardDeclaration } from '../c++/getForwardDeclaration.js'
import { includeHeader } from '../c++/includeNitroHeader.js'
import { getAllTypes } from '../getAllTypes.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { createFileMetadataString, isNotDuplicate } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { Method } from '../Method.js'
import type { Property } from '../Property.js'
import type { SourceFile, SourceImport } from '../SourceFile.js'
import { addJNINativeRegistration } from './JNINativeRegistrations.js'
import { KotlinCxxBridgedType } from './KotlinCxxBridgedType.js'

export function createFbjniHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const name = getHybridObjectName(spec.name)

  // Because we cache JNI methods as `static` inside our method bodies,
  // we need to re-create the method bodies per inherited class.
  // This way `Child`'s statically cached `someMethod()` JNI reference
  // is not the same as `Base`'s statically cached `someMethod()` JNI reference.
  const properties = [
    ...spec.properties,
    ...spec.baseTypes.flatMap((b) => b.properties),
  ]
  const methods = [...spec.methods, ...spec.baseTypes.flatMap((b) => b.methods)]

  const propertiesDecl = properties
    .map((p) => p.getCode('c++', { override: true }))
    .join('\n')
  const methodsDecl = methods
    .map((p) => p.getCode('c++', { override: true }))
    .join('\n')
  const jniClassDescriptor = NitroConfig.getAndroidPackage(
    'c++/jni',
    name.HybridTSpec
  )
  const cxxNamespace = NitroConfig.getCxxNamespace('c++')
  const spaces = createIndentation(name.JHybridTSpec.length)

  let cppBase = 'JHybridObject'
  if (spec.baseTypes.length > 0) {
    if (spec.baseTypes.length > 1) {
      throw new Error(
        `${name.T}: Inheriting from multiple HybridObject bases is not yet supported on Kotlin!`
      )
    }
    cppBase = getHybridObjectName(spec.baseTypes[0]!.name).JHybridTSpec
  }
  const cppImports: SourceImport[] = []
  const cppConstructorCalls = [`HybridObject(${name.HybridTSpec}::TAG)`]
  for (const base of spec.baseTypes) {
    const { JHybridTSpec } = getHybridObjectName(base.name)
    cppConstructorCalls.push('HybridBase(jThis)')
    cppImports.push({
      language: 'c++',
      name: `${JHybridTSpec}.hpp`,
      space: 'user',
      forwardDeclaration: getForwardDeclaration(
        'class',
        JHybridTSpec,
        NitroConfig.getCxxNamespace('c++')
      ),
    })
  }

  const cppHeaderCode = `
${createFileMetadataString(`${name.HybridTSpec}.hpp`)}

#pragma once

#include <NitroModules/JHybridObject.hpp>
#include <fbjni/fbjni.h>
#include "${name.HybridTSpec}.hpp"

${cppImports
  .map((i) => i.forwardDeclaration)
  .filter((f) => f != null)
  .join('\n')}
${cppImports.map((i) => includeHeader(i)).join('\n')}

namespace ${cxxNamespace} {

  using namespace facebook;

  class ${name.JHybridTSpec}: public jni::HybridClass<${name.JHybridTSpec}, ${cppBase}>,
${spaces}          public virtual ${name.HybridTSpec} {
  public:
    static auto constexpr kJavaDescriptor = "L${jniClassDescriptor};";
    static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis);
    static void registerNatives();

  protected:
    // C++ constructor (called from Java via \`initHybrid()\`)
    explicit ${name.JHybridTSpec}(jni::alias_ref<jhybridobject> jThis) :
      ${indent(cppConstructorCalls.join(',\n'), '      ')},
      _javaPart(jni::make_global(jThis)) {}

  public:
    virtual ~${name.JHybridTSpec}() {
      // Hermes GC can destroy JS objects on an arbitrary Thread which might not be
      // connected to the JNI environment. To make sure fbjni can properly destroy
      // the Java method, we connect to a JNI environment first.
      jni::ThreadScope::WithClassLoader([&] { _javaPart.reset(); });
    }

  public:
    size_t getExternalMemorySize() noexcept override;

  public:
    inline const jni::global_ref<${name.JHybridTSpec}::javaobject>& getJavaPart() const noexcept {
      return _javaPart;
    }

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

  // Make sure we register all native JNI methods on app startup
  addJNINativeRegistration({
    namespace: cxxNamespace,
    className: `${name.JHybridTSpec}`,
    import: {
      name: `${name.JHybridTSpec}.hpp`,
      space: 'user',
      language: 'c++',
    },
  })

  const propertiesImpl = properties
    .map((m) => getFbjniPropertyForwardImplementation(spec, m))
    .join('\n')
  const methodsImpl = methods
    .map((m) => getFbjniMethodForwardImplementation(spec, m))
    .join('\n')
  const allTypes = getAllTypes(spec)
  const jniImports = allTypes
    .map((t) => new KotlinCxxBridgedType(t))
    .flatMap((t) => t.getRequiredImports())
    .filter((i) => i != null)
  const cppIncludes = jniImports
    .map((i) => includeHeader(i))
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
    return method(_javaPart);
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

  const returnJNI = new KotlinCxxBridgedType(method.returnType)

  const returnType = returnJNI.asJniReferenceType('local')
  const paramsTypes = method.parameters
    .map((p) => {
      const bridge = new KotlinCxxBridgedType(p.type)
      return `${bridge.asJniReferenceType('alias')} /* ${p.name} */`
    })
    .join(', ')
  const cxxSignature = `${returnType}(${paramsTypes})`

  const paramsForward = method.parameters.map((p) => {
    const bridged = new KotlinCxxBridgedType(p.type)
    return bridged.parse(p.name, 'c++', 'kotlin', 'c++')
  })
  paramsForward.unshift('_javaPart') // <-- first param is always Java `this`

  let body: string
  if (returnJNI.hasType) {
    // return something - we need to parse it
    body = `
static const auto method = _javaPart->getClass()->getMethod<${cxxSignature}>("${method.name}");
auto __result = method(${paramsForward.join(', ')});
return ${returnJNI.parse('__result', 'kotlin', 'c++', 'c++')};
    `
  } else {
    // void method. no return
    body = `
static const auto method = _javaPart->getClass()->getMethod<${cxxSignature}>("${method.name}");
method(${paramsForward.join(', ')});
   `
  }
  const code = method.getCode(
    'c++',
    {
      classDefinitionName: name.JHybridTSpec,
    },
    body.trim()
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
