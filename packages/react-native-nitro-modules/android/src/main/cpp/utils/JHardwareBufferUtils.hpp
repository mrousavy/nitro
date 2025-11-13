//
//  JHardwareBufferUtils.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 11.07.25.
//

#pragma once

#include "SafeHardwareBuffer.hpp"
#include <android/hardware_buffer.h>
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

class JHardwareBufferUtils final : public jni::JavaClass<JHardwareBufferUtils> {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/utils/HardwareBufferUtils;";

public:
  static void copyBoxedHardwareBufferIntoExistingBoxedHardwareBuffer(jni::alias_ref<jni::JClass>,
                                                                     jni::alias_ref<jni::JObject> boxedSourceHardwareBuffer,
                                                                     jni::alias_ref<jni::JObject> boxedDestinationHardwareBuffer);

  static jni::local_ref<jni::JObject>
  copyBoxedHardwareBufferIntoNewBoxedHardwareBuffer(jni::alias_ref<jni::JClass>, jni::alias_ref<jni::JObject> boxedSourceHardwareBuffer);

  static void copyHardwareBuffer(SafeHardwareBuffer& source, SafeHardwareBuffer& destination);

public:
  static void registerNatives() {
    javaClassStatic()->registerNatives(
        {makeNativeMethod("copyHardwareBuffer", JHardwareBufferUtils::copyBoxedHardwareBufferIntoExistingBoxedHardwareBuffer),
         makeNativeMethod("copyHardwareBuffer", JHardwareBufferUtils::copyBoxedHardwareBufferIntoNewBoxedHardwareBuffer)});
  }
};

} // namespace margelo::nitro
