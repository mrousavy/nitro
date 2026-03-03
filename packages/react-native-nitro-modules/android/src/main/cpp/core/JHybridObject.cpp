//
//  JHybridObject.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 11.08.25.
//

#include "JHybridObject.hpp"
#include "JNISharedPtr.hpp"
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

// virtual destructor lives here, so its not duplicated across all libraries
JHybridObject::CxxPart::~CxxPart() {}

jni::local_ref<JHybridObject::CxxPart::jhybriddata> JHybridObject::CxxPart::initHybrid(jni::alias_ref<jhybridobject> jThis) {
  return makeCxxInstance(jThis);
}

void JHybridObject::CxxPart::registerNatives() {
  registerHybrid({
     makeNativeMethod("initHybrid", JHybridObject::CxxPart::initHybrid),
  });
}

JHybridObject::JHybridObject(jni::alias_ref<JHybridObject::JavaPart> javaPart): _javaPart(jni::make_global(javaPart)) {
  // called from subclasses
}

JHybridObject::~JHybridObject() {
  // Hermes GC can destroy JS objects on a non-JNI Thread.
  jni::ThreadScope::WithClassLoader([&] { _javaPart.reset(); });
}

size_t JHybridObject::getExternalMemorySize() noexcept {
  static const auto method = _javaPart->javaClassStatic()->getMethod<jlong()>("getMemorySize");
  return method(_javaPart);
}

bool JHybridObject::equals(const std::shared_ptr<HybridObject>& other) {
  if (auto otherJHybrid = std::dynamic_pointer_cast<JHybridObject>(other)) {
    return jni::isSameObject(_javaPart, otherJHybrid->_javaPart);
  }
  return false;
}

void JHybridObject::dispose() noexcept {
  static const auto method = _javaPart->javaClassStatic()->getMethod<void()>("dispose");
  method(_javaPart);
}

std::string JHybridObject::toString() {
  static const auto method = _javaPart->javaClassStatic()->getMethod<jni::JString()>("toString");
  auto javaString = method(_javaPart);
  return javaString->toStdString();
}

} // namespace margelo::nitro
