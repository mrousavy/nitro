import { getHybridObjectName } from '../getHybridObjectName.js'
import type { SourceImport } from '../SourceFile.js'

interface Props {
  /**
   * The name of the Hybrid Object under which it should be registered and exposed to JS to.
   */
  hybridObjectName: string
}

interface JNIHybridObjectRegistration {
  cppCode: string
  requiredImports: SourceImport[]
}

export function createJNIHybridObjectRegistration({
  hybridObjectName,
}: Props): JNIHybridObjectRegistration {
  const { JHybridTSpec } = getHybridObjectName(hybridObjectName)

  return {
    requiredImports: [
      { name: `${JHybridTSpec}.hpp`, language: 'c++', space: 'user' },
    ],
    cppCode: `
HybridObjectRegistry::registerHybridObjectConstructor(
  "${hybridObjectName}",
  []() -> std::shared_ptr<HybridObject> {
    jni::local_ref<${JHybridTSpec}::JavaPart> javaPart = ${JHybridTSpec}::JavaPart::callDefaultConstructor();
    return std::make_shared<${JHybridTSpec}>(javaPart);
  }
);
      `.trim(),
  }
}
