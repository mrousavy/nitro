//
//  AutolinkedHybridObject.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 11.11.24.
//

#pragma once

#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

template <typename T>
class AutolinkedHybridObject {
public:
  explicit AutolinkedHybridObject(const char* javaClassDescriptor) {
    try {
      // Find JNI class and default constructor
      javaClass = jni::findClassStatic(javaClassDescriptor);
      defaultConstructor = javaClass->getConstructor<T()>();
    } catch (const jni::JniException& exc) [[unlikely]] {
      std::string message = exc.what();
      if (message.find("ClassNotFoundException")) {
        // Java class cannot be found
        throw std::runtime_error("Couldn't find class `${javaNamespace}`!\n"
                                 "- Make sure the class exists in the specified namespace.\n"
                                 "- Make sure the class is not stripped. If you are using ProGuard, add `@Keep` and `@DoNotStrip` annotations to ${jniClassName}.");
      } else if (message.find("NoSuchMethodError")) {
        // Default Constructor cannot be found
        throw std::runtime_error("Couldn't find ${jniClassName}'s default constructor!\n"
                                 "- If you want to autolink ${jniClassName}, add a default constructor that takes zero arguments.\n"
                                 "- If you need arguments to create instances of ${jniClassName}, create a separate HybridObject that acts as a factory for this HybridObject to create instances of it with parameters.\n"
                                 "- If you already have a default constructor, make sure it is not being stripped. If you are using ProGuard, add `@Keep` and `@DoNotStrip` annotations to the default constructor.");
      } else {
        throw;
      }
    }
  }

public:
  jni::local_ref<T> create() const {
    // Calls the class's default constructor
    return _javaClass->newObject(_defaultConstructor);
  }

private:
  jni::alias_ref<jni::JClass> _javaClass;
  jni::JConstructor<T()> _defaultConstructor;
};

} // namespace margelo::nitro
