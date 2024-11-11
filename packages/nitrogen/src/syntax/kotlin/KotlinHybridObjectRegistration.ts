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
  const javaNamespace = NitroConfig.getAndroidPackage(
    'java/kotlin',
    jniClassName
  )

  return {
    requiredImports: [
      { name: `${JHybridTSpec}.hpp`, language: 'c++', space: 'user' },
      {
        name: 'NitroModules/JNISharedPtr.hpp',
        language: 'c++',
        space: 'system',
      },
    ],
    cppCode: `
HybridObjectRegistry::registerHybridObjectConstructor(
  "${hybridObjectName}",
  []() -> std::shared_ptr<HybridObject> {
    static jni::alias_ref<jni::JClass> javaClass;
    static jni::JConstructor<${JHybridTSpec}::javaobject()> defaultConstructor;
    static bool isInitialized;
    try {
      if (!isInitialized) {
        javaClass = jni::findClassStatic("${jniNamespace}");
        defaultConstructor = javaClass->getConstructor<${JHybridTSpec}::javaobject()>();
        isInitialized = true;
      }
    } catch (const jni::JniException& exc) {
      std::string message = exc.what();
      if (message.find("ClassNotFoundException")) {
        throw std::runtime_error("Couldn't find class \\"${javaNamespace}\\"!\\n"
                                 "- Make sure the class exists in the specified namespace.\\n"
                                 "- Make sure the class is not stripped. If you are using ProGuard, add @Keep and @DoNotStrip annotations to ${jniClassName}.");
      } else if (message.find("NoSuchMethodError")) {
        throw std::runtime_error("Couldn't find ${jniClassName}'s default constructor!\\n"
                                 "- If you don't have one, make sure to add a constructor that takes zero arguments (= default constructor).\\n"
                                 "- If you need arguments to create instances of ${jniClassName}, create a separate HybridObject that acts as a factory for this HybridObject to create instances of it with parameters.\\n"
                                 "- If you already have a default constructor, make sure it is not being stripped. If you are using ProGuard, add @Keep and @DoNotStrip annotations to the default constructor.");
      } else {
        throw;
      }
    }

    auto instance = javaClass->newObject(defaultConstructor);
#ifdef NITRO_DEBUG
    if (instance == nullptr) [[unlikely]] {
      throw std::runtime_error("Failed to create an instance of \\"${JHybridTSpec}\\" - the constructor returned null!");
    }
#endif
    auto globalRef = jni::make_global(instance);
    return JNISharedPtr::make_shared_from_jni<${JHybridTSpec}>(globalRef);
  }
);
      `.trim(),
  }
}
