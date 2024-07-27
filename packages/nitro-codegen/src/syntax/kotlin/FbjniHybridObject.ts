import { indent } from '../../stringUtils.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import { createFileMetadataString } from '../helpers.js'
import type { HybridObjectSpec } from '../HybridObjectSpec.js'
import type { SourceFile } from '../SourceFile.js'

export function createFbjniHybridObject(spec: HybridObjectSpec): SourceFile[] {
  const name = getHybridObjectName(spec.name)
  const propertiesDecl = spec.properties
    .map((p) => p.getCode('c++', { override: true }))
    .join('\n')
  const methodsDecl = spec.methods
    .map((p) => p.getCode('c++', { override: true }))
    .join('\n')

  const cppHeaderCode = `
${createFileMetadataString(`${name.JTSpec}.hpp`)}

#include "${name.HybridT}.hpp"
#include <fbjni/fbjni.h>

using namespace facebook;

class ${name.JTSpec}: public jni::HybridClass<${name.JTSpec}>, public ${name.HybridT} {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/${name.TSpec};";
  static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis);
  static void registerNatives();

private:
  // C++ constructor (called from Java via \`initHybrid()\`)
  explicit ${name.JTSpec}(jni::alias_ref<jhybridobject> jThis) : _javaPart(jni::make_global(jThis)) {}

public:
  // Properties
  ${indent(propertiesDecl, '  ')}

public:
  // Methods
  ${indent(methodsDecl, '  ')}

private:
  friend HybridBase;
  jni::global_ref<${name.JTSpec}::javaobject> _javaPart;
};

  `.trim()
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

  `.trim()

  const files: SourceFile[] = []
  files.push({
    content: cppHeaderCode,
    language: 'c++',
    name: `${name.JTSpec}.hpp`,
    platform: 'android',
  })
  files.push({
    content: cppImplCode,
    language: 'c++',
    name: `${name.JTSpec}.cpp`,
    platform: 'android',
  })
  return files
}
