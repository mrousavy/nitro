//
//  JHybridObject.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 11.08.25.
//

#include "JHybridObject.hpp"
#include "JNISharedPtr.hpp"
#include <fbjni/fbjni.h>
#include <memory>

namespace margelo::nitro {

using namespace facebook;

void JHybridObject::initSharedBase(const jni::local_ref<JHybridObject>& self) {
  if (!weak_from_this().expired()) {
    // We already have a valid std::shared_from_this base!
    return;
  }
  // call this once - this will construct a std::shared_ptr from `self` (which implicitly
  // initializes the `std::shared_from_this` base), using jni::global_ref as a custom deleter.
  JNISharedPtr::make_shared_from_jni(self);
}

} // namespace margelo::nitro
