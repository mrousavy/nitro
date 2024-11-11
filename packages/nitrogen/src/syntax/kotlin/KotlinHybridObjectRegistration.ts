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
  cppCode: string
  requiredImports: SourceImport[]
}

export function createJNIHybridObjectRegistration({
  hybridObjectName,
  jniClassName,
}: Props): JNIHybridObjectRegistration {
  const { JHybridTSpec } = getHybridObjectName(hybridObjectName)
  const jniNamespace = NitroConfig.getAndroidPackage('c++/jni', jniClassName)

  return {
    requiredImports: [
      { name: `${JHybridTSpec}.hpp`, language: 'c++', space: 'user' },
      {
        name: 'NitroModules/JNISharedPtr.hpp',
        language: 'c++',
        space: 'system',
      },
      {
        name: 'NitroModules/DefaultConstructableObject.hpp',
        language: 'c++',
        space: 'system',
      },
    ],
    cppCode: `
HybridObjectRegistry::registerHybridObjectConstructor(
  "${hybridObjectName}",
  []() -> std::shared_ptr<HybridObject> {
    static DefaultConstructableObject<${JHybridTSpec}::javaobject> object("${jniNamespace}");
    auto instance = object.create();
    auto globalRef = jni::make_global(instance);
    return JNISharedPtr::make_shared_from_jni<${JHybridTSpec}>(globalRef);
  }
);
      `.trim(),
  }
}
