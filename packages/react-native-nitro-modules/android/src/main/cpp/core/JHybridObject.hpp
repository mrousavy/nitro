//
//  JHybridObject.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include "HybridObject.hpp"
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

struct JHybridObject : public jni::HybridClass<JHybridObject>, public HybridObject {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/HybridObject;";

private:
  explicit JHybridObject(jni::alias_ref<jhybridobject> jThis): HybridObject(TAG), _javaPart(jni::make_global(jThis)) { }

public:
  static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis);
  static void registerNatives();

private:
  static constexpr auto TAG = "HybridObject";
  friend HybridBase;
  jni::global_ref<JHybridObject::javaobject> _javaPart;
};

} // namespace margelo::nitro
