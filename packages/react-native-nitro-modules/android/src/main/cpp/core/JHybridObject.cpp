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

std::shared_ptr<HybridObject> JHybridObject::shared() {
  if (_javaPart == nullptr) {
    // We don't have a JNI reference! We have to hope this class was constructed with a shared_ptr in the beginning...
    return HybridObject::shared();
  }
  if (auto shared = weak_from_this().lock()) {
    // We have a cached shared_ptr
    return shared;
  }
  return JNISharedPtr::make_shared_from_jni<JHybridObject>(_javaPart);
}

} // namespace margelo::nitro
