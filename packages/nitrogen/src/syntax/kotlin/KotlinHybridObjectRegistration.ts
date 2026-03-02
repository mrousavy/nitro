import { NitroConfig } from '../../config/NitroConfig.js'
import { getHybridObjectName } from '../getHybridObjectName.js'
import type { SourceImport } from '../SourceFile.js'

interface Props {
  /**
   * The name of the Hybrid Object under which it should be registered and exposed to JS to.
   */
  hybridObjectName: string
  /**
   * The name of the Kotlin/Java class that will be default-constructed
   */
  jniClassName: string
}

interface JNIHybridObjectRegistration {
  cppDefinition: string
  cppRegistrationCode: string
  requiredImports: SourceImport[]
}

export function createJNIHybridObjectRegistration({
  hybridObjectName,
  jniClassName,
}: Props): JNIHybridObjectRegistration {
  const { JHybridTSpec } = getHybridObjectName(hybridObjectName)
  const jniClassDescriptor = NitroConfig.current.getAndroidPackage(
    'c++/jni',
    jniClassName
  )

  return {
    requiredImports: [
      { name: `${JHybridTSpec}.hpp`, language: 'c++', space: 'user' },
    ],
    cppDefinition: `
struct ${JHybridTSpec}Impl: public jni::JavaClass<${JHybridTSpec}Impl, ${JHybridTSpec}::JavaPart> {
  static auto constexpr kJavaDescriptor = "L${jniClassDescriptor};";
  static std::shared_ptr<${JHybridTSpec}> create() {
    jni::local_ref<${JHybridTSpec}Impl> javaPart = newInstance();
    return std::make_shared<${JHybridTSpec}>(javaPart);
  }
};
    `.trim(),
    cppRegistrationCode: `
HybridObjectRegistry::registerHybridObjectConstructor(
  "${hybridObjectName}",
  []() -> std::shared_ptr<HybridObject> {
    return ${JHybridTSpec}Impl::create();
  }
);
      `.trim(),
  }
}
