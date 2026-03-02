//
//  JHybridObject.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 02.03.26.
//

#include "JHybridObject.hpp"
#include "HybridObject.hpp"
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

size_t JHybridObject::getExternalMemorySize() noexcept {
  static const auto method = JavaPart::javaClassStatic()->getMethod<jlong()>("getMemorySize");
  return method(_javaPart);
}
bool JHybridObject::equals(const std::shared_ptr<HybridObject>& other) {
  if (auto otherCast = std::dynamic_pointer_cast<JHybridObject>(other)) {
    return jni::isSameObject(_javaPart, otherCast->_javaPart);
  }
  return false;
}
void JHybridObject::dispose() noexcept {
  static const auto method = JavaPart::javaClassStatic()->getMethod<void()>("dispose");
  method(_javaPart);
}
std::string JHybridObject::toString() {
  static const auto method = JavaPart::javaClassStatic()->getMethod<jni::JString()>("toString");
  auto javaString = method(_javaPart);
  return javaString->toStdString();
}

} // namespace margelo::nitro
