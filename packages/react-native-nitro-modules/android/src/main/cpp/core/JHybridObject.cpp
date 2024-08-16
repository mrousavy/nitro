//
//  JHybridObject.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#include "JHybridObject.hpp"

namespace margelo::nitro {

void JHybridObject::registerNatives() {
  registerHybrid({makeNativeMethod("initHybrid", JHybridObject::initHybrid)});
}

jni::local_ref<JHybridObject::jhybriddata> JHybridObject::initHybrid(jni::alias_ref<jhybridobject> jThis) {
  return makeCxxInstance(jThis);
}

} // namespace margelo::nitro
