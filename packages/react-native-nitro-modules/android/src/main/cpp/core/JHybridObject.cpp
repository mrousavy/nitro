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

std::shared_ptr<JHybridObject> JHybridObject::JavaPart::getJHybridObject() {
  jni::local_ref<JHybridObject::JavaPart> javaPart = jni::make_local(self());
  // dispose() takes the same Java monitor. Hold it until after cthis() so HybridData
  // cannot be reset between retrieving the CxxPart and accessing its native instance.
  auto javaPartLock = javaPart->lock();

  static const auto method = javaClassStatic()->getMethod<JHybridObject::CxxPart::javaobject()>("getCxxPart");
  jni::local_ref<JHybridObject::CxxPart::javaobject> cxxPart = method(javaPart);
  std::shared_ptr<JHybridObject> hybridObject = cxxPart->cthis()->getOrCreateHybridObject(javaPart);
  return hybridObject;
}

// Generated subclasses inherit this constructor and still pass their Java CxxPart.
// Java owns that reference now, so native code intentionally does not retain it.
JHybridObject::CxxPart::CxxPart(jni::alias_ref<jhybridobject>) {}

std::shared_ptr<JHybridObject> JHybridObject::CxxPart::getOrCreateHybridObject(const jni::local_ref<JHybridObject::JavaPart>& javaPart) {
  std::lock_guard<std::mutex> lock(_hybridObjectMutex);
  if (auto cached = _hybridObject.lock()) {
    return cached;
  }
  auto hybridObject = createHybridObject(javaPart);
  _hybridObject = hybridObject;
  return hybridObject;
}

std::shared_ptr<JHybridObject> JHybridObject::CxxPart::createHybridObject(const jni::local_ref<JHybridObject::JavaPart>& javaPart) {
  return std::make_shared<JHybridObject>(javaPart);
}

jni::local_ref<JHybridObject::CxxPart::jhybriddata> JHybridObject::CxxPart::initHybrid(jni::alias_ref<jhybridobject> cxxJavaPart) {
  return makeCxxInstance(cxxJavaPart);
}

void JHybridObject::CxxPart::registerNatives() {
  registerHybrid({
      makeNativeMethod("initHybrid", JHybridObject::CxxPart::initHybrid),
  });
}

JHybridObject::JHybridObject(const jni::local_ref<JHybridObject::JavaPart>& javaPart) : _javaPart(jni::make_global(javaPart)) {
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
