import { NitroConfig } from '../../config/NitroConfig.js'
import { createIndentation, indent } from '../../utils.js'
import { includeHeader } from '../c++/includeNitroHeader.js'
import { getAllTypes } from '../getAllTypes.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import {
  createFileMetadataString,
  isNotDuplicate,
  toReferenceType,
} from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import { Method } from '../Method.js'
import type { Property } from '../Property.js'
import type { SourceFile } from '../SourceFile.js'
import { addJNINativeRegistration } from './JNINativeRegistrations.js'
import { KotlinCxxBridgedType } from './KotlinCxxBridgedType.js'

export function createFbjniHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const name = getHybridObjectName(spec.name)

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

  const propertiesDecl = spec.properties
    .map((p) => p.getCode('c++', { override: true }))
    .join('\n')
  const methodsDecl = spec.methods
    .map((p) => p.getCode('c++', { override: true }))
    .join('\n')
  const jniPropertiesDecl = spec.properties
    .map((p) => getJniOverridePropertySignature(p))
    .join('\n')
  const jniMethdsDecl = spec.methods
    .map((m) => getJniOverrideMethodSignature(m))
    .join('\n')
  const jniClassDescriptor = NitroConfig.getAndroidPackage(
    'c++/jni',
    name.HybridTSpec
  )

  const cxxNamespace = NitroConfig.getCxxNamespace('c++')
  const spaces = createIndentation(name.JHybridTSpec.length)

  const cppHeaderCode = `
${createFileMetadataString(`${name.HybridTSpec}.hpp`)}

#pragma once

#include <NitroModules/JSIConverter.hpp>
#include <NitroModules/JHybridObject.hpp>
#include <fbjni/fbjni.h>
#include "${name.HybridTSpec}.hpp"

${cppForwardDeclarations.join('\n')}

${cppIncludes.join('\n')}

namespace ${cxxNamespace} {

  using namespace facebook;

  class ${name.JHybridTSpec} final: public jni::HybridClass<${name.JHybridTSpec}, JHybridObject>,
${spaces}                public ${name.HybridTSpec} {
  public:
    static auto constexpr kJavaDescriptor = "L${jniClassDescriptor};";
    static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis);
    static void registerNatives();

  private:
    // C++ constructor (called from Java via \`initHybrid()\`)
    explicit ${name.JHybridTSpec}(jni::alias_ref<jhybridobject> jThis) :
      HybridObject(${name.HybridTSpec}::TAG),
      HybridBase /* JHybridObject */ (jni::static_ref_cast<JHybridObject::javaobject>(jThis)),
      _javaPart(jni::make_global(jThis)) {}

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

  public:
    // Properties (overriden by JNI)
    ${indent(jniPropertiesDecl, '    ')}

  public:
    // Methods (overriden by JNI)
    ${indent(jniMethdsDecl, '    ')}

  protected:
    // Override prototype to use JNI methods
    void loadHybridMethods() override;

  private:
    friend HybridBase;
    using HybridBase::HybridBase;
    jni::global_ref<${name.JHybridTSpec}::javaobject> _javaPart;
  };

} // namespace ${cxxNamespace}

namespace margelo::nitro {

  // NativeState<{}> <> ${name.JHybridTSpec}
  template <>
  struct JSIConverter<${name.JHybridTSpec}::javaobject> final {
    static inline jni::local_ref<${name.JHybridTSpec}::javaobject> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      jsi::Object object = arg.asObject(runtime);
      if (!object.hasNativeState<JHybridObject>(runtime)) [[unlikely]] {
        std::string typeDescription = arg.toString(runtime).utf8(runtime);
        throw std::runtime_error("Cannot convert \\"" + typeDescription + "\\" to JHybridObject! It does not have a NativeState.");
      }
      std::shared_ptr<jsi::NativeState> nativeState = object.getNativeState(runtime);
      std::shared_ptr<${name.JHybridTSpec}> jhybridObject = std::dynamic_pointer_cast<${name.JHybridTSpec}>(nativeState);
      return jni::make_local(jhybridObject->getJavaPart());
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<${name.JHybridTSpec}::javaobject>& arg) {
      return arg->cthis()->toObject(runtime);
    }
    static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      if (!value.isObject()) {
        return false;
      }
      jsi::Object object = value.getObject(runtime);
      return object.hasNativeState<${name.JHybridTSpec}>(runtime);
    }
  };

} // namespace margelo::nitro
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

  const propertiesImpl = spec.properties
    .map((p) => getFbjniPropertyForwardImplementation(spec, p))
    .join('\n')
  const methodsImpl = spec.methods
    .map((m) => getFbjniMethodForwardImplementation(spec, m))
    .join('\n')
  const jniPropertiesImpl = spec.properties
    .map((p) => getJniOverridePropertyImplementation(spec, p))
    .join('\n')
  const jniMethodsImpl = spec.methods
    .map((m) => getJniOverrideMethodImplementation(spec, m))
    .join('\n')
  const propertyOverrideRegistrations = spec.properties
    .flatMap((p) => {
      const getterRegistration = `prototype.registerHybridGetter("${p.name}", &${name.JHybridTSpec}::${p.cppGetterName}JNI);`
      if (p.isReadonly) {
        return [getterRegistration]
      } else {
        return [
          getterRegistration,
          `prototype.registerHybridSetter("${p.name}", &${name.JHybridTSpec}::${p.cppSetterName}JNI);`,
        ]
      }
    })
    .join('\n')
  const methodOverrideRegistrations = spec.methods
    .map(
      (m) =>
        `prototype.registerHybridMethod("${m.name}", &${name.JHybridTSpec}::${m.name}JNI);`
    )
    .join('\n')
  const cppImplCode = `
${createFileMetadataString(`${name.JHybridTSpec}.cpp`)}

#include "${name.JHybridTSpec}.hpp"
#include <NitroModules/JSIConverter+JNI.hpp>

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

  // JNI Properties
  ${indent(jniPropertiesImpl, '  ')}

  // JNI Methods
  ${indent(jniMethodsImpl, '  ')}

  void ${name.JHybridTSpec}::loadHybridMethods() {
    // Load base Prototype methods
    ${name.HybridTSpec}::loadHybridMethods();
    // Override base Prototype methods with JNI methods
    registerHybrids(this, [](Prototype& prototype) {
      ${indent(propertyOverrideRegistrations, '      ')}
      ${indent(methodOverrideRegistrations, '      ')}
    });
  }

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

function getJniOverrideMethodImplementation(
  spec: HybridObjectSpec,
  method: Method
): string {
  const name = getHybridObjectName(spec.name)

  const returnJNI = new KotlinCxxBridgedType(method.returnType)

  const paramsSignature = method.parameters
    .map((p) => {
      const bridge = new KotlinCxxBridgedType(p.type)
      if (bridge.canBePassedByReference) {
        return `${toReferenceType(bridge.asJniReferenceType('local'))} ${p.name}`
      } else {
        return `${bridge.asJniReferenceType('local')} ${p.name}`
      }
    })
    .join(', ')
  const returnType = returnJNI.asJniReferenceType('local')
  const paramsTypes = method.parameters
    .map((p) => {
      const bridge = new KotlinCxxBridgedType(p.type)
      return `${bridge.asJniReferenceType('alias')} /* ${p.name} */`
    })
    .join(', ')
  const jniSignature = `${returnType}(${paramsTypes})`

  const paramsForward = [
    '_javaPart',
    ...method.parameters.map((p) => p.name),
  ].join(', ')

  return `
${returnType} ${name.JHybridTSpec}::${method.name}JNI(${paramsSignature}) {
  static const auto method = _javaPart->getClass()->getMethod<${jniSignature}>("${method.name}");
  return method(${paramsForward});
}
    `.trim()
}

function getJniOverridePropertyImplementation(
  spec: HybridObjectSpec,
  property: Property
): string {
  const methods = property.cppMethods.map((m) =>
    getJniOverrideMethodImplementation(spec, m)
  )

  return methods.join('\n')
}

function getFbjniMethodForwardImplementation(
  spec: HybridObjectSpec,
  method: Method
): string {
  const name = getHybridObjectName(spec.name)

  const returnJNI = new KotlinCxxBridgedType(method.returnType)
  const paramsForward = method.parameters.map((p) => {
    const bridged = new KotlinCxxBridgedType(p.type)
    return bridged.parse(p.name, 'c++', 'kotlin', 'c++')
  })

  let body: string
  if (returnJNI.hasType) {
    // return something - we need to parse it
    body = `
auto result = this->${method.name}JNI(${paramsForward.join(', ')});
return ${returnJNI.parseFromKotlinToCpp('result', 'c++')};
    `
  } else {
    // void method. no return
    body = `
this->${method.name}JNI(${paramsForward.join(', ')});
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

function getJniOverridePropertySignature(property: Property): string {
  const bridged = new KotlinCxxBridgedType(property.type)
  const lines: string[] = []
  // Getter signature
  lines.push(
    `${bridged.asJniReferenceType('local')} ${property.cppGetterName}JNI();`
  )
  if (!property.isReadonly) {
    const type = bridged.canBePassedByReference
      ? toReferenceType(bridged.asJniReferenceType('local'))
      : bridged.asJniReferenceType('local')
    // Setter signature
    lines.push(`void ${property.cppSetterName}JNI(${type} ${property.name});`)
  }
  return lines.join('\n')
}

function getJniOverrideMethodSignature(method: Method): string {
  const bridgedReturn = new KotlinCxxBridgedType(method.returnType)
  const parameters = method.parameters.map((p) => {
    const bridged = new KotlinCxxBridgedType(p.type)
    if (bridged.canBePassedByReference) {
      return `${toReferenceType(bridged.asJniReferenceType('local'))} ${p.name}`
    } else {
      return `${bridged.asJniReferenceType('local')} ${p.name}`
    }
  })
  return `${bridgedReturn.asJniReferenceType('local')} ${method.name}JNI(${parameters.join(', ')});`
}
