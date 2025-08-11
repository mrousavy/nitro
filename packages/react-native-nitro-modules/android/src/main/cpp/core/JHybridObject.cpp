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
  if (auto shared = weak_from_this().lock()) {
    // We have a cached shared_ptr
    return shared;
  }
  if (_javaPart == nullptr) [[unlikely]] {
    // We don't have a _javaPart! Maybe the implementing JHybridObject
    // was generated with an old version of nitrogen which doesn't call the JHybridObject(…)
    // constructor yet. This is bad!
    throw std::runtime_error(std::string("JHybridObject \"") + getName() +
                             "\" does not have a _javaPart, "
                             "and wasn't constructed from a std::shared_ptr! "
                             "Try upgrading nitrogen and re-generate your specs.");
  }
  return JNISharedPtr::make_shared_from_jni<JHybridObject>(_javaPart);
}

JHybridObject::~JHybridObject() {
  // Hermes GC can destroy JS objects on a non-JNI Thread.
  jni::ThreadScope::WithClassLoader([&] { _javaPart.reset(); });
}

} // namespace margelo::nitro
