//
//  JHardwareBufferUtils.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 11.07.25.
//

#include "JHardwareBufferUtils.hpp"
#include "NitroDefines.hpp"
#include <android/hardware_buffer_jni.h>

namespace margelo::nitro {

size_t JHardwareBufferUtils::getHardwareBufferSize([[maybe_unused]] AHardwareBuffer* hardwareBuffer) {
#if __ANDROID_API__ >= 26
  AHardwareBuffer_Desc description;
  AHardwareBuffer_describe(hardwareBuffer, &description);
  size_t sourceSize = description.height * description.stride;
  return sourceSize;
#else
  throw std::runtime_error("ArrayBuffer(HardwareBuffer) requires NDK API 26 or above! (minSdk >= 26)");
#endif
}

jni::local_ref<jni::JObject>
JHardwareBufferUtils::copyHardwareBufferBoxedNew(jni::alias_ref<jni::JClass>,
                                                 [[maybe_unused]] jni::alias_ref<jni::JObject> boxedHardwareBuffer) {
#if __ANDROID_API__ >= 26
  // 1. Unbox HardwareBuffer from jobject
  AHardwareBuffer* sourceHardwareBuffer = AHardwareBuffer_fromHardwareBuffer(jni::Environment::current(), boxedHardwareBuffer.get());
  // 2. Describe the buffer
  AHardwareBuffer_Desc description;
  AHardwareBuffer_describe(sourceHardwareBuffer, &description);
  // 3. Create a new buffer from the same description
  AHardwareBuffer* destinationHardwareBuffer;
  AHardwareBuffer_allocate(&description, &destinationHardwareBuffer);
  // 4. Copy the data over
  copyHardwareBuffer(sourceHardwareBuffer, destinationHardwareBuffer);
  // 5. Box it into jobject again
  jobject boxed = AHardwareBuffer_toHardwareBuffer(jni::Environment::current(), destinationHardwareBuffer);
  return jni::make_local(boxed);
#else
  throw std::runtime_error("ArrayBuffer(HardwareBuffer) requires NDK API 26 or above! (minSdk >= 26)");
#endif
}

void JHardwareBufferUtils::copyHardwareBufferBoxed(jni::alias_ref<jni::JClass>,
                                                   [[maybe_unused]] jni::alias_ref<jni::JObject> boxedSourceHardwareBuffer,
                                                   [[maybe_unused]] jni::alias_ref<jni::JObject> boxedDestinationHardwareBuffer) {
#if __ANDROID_API__ >= 26
  // 1. Unbox HardwareBuffer from jobject
  AHardwareBuffer* sourceHardwareBuffer = AHardwareBuffer_fromHardwareBuffer(jni::Environment::current(), boxedSourceHardwareBuffer.get());
  AHardwareBuffer* destinationHardwareBuffer =
      AHardwareBuffer_fromHardwareBuffer(jni::Environment::current(), boxedDestinationHardwareBuffer.get());
  // 2. Copy data over from source -> destination
  copyHardwareBuffer(sourceHardwareBuffer, destinationHardwareBuffer);
#else
  throw std::runtime_error("ArrayBuffer(HardwareBuffer) requires NDK API 26 or above! (minSdk >= 26)");
#endif
}

void JHardwareBufferUtils::copyHardwareBuffer([[maybe_unused]] AHardwareBuffer* sourceHardwareBuffer,
                                              [[maybe_unused]] AHardwareBuffer* destinationHardwareBuffer) {
#if __ANDROID_API__ >= 26
  // 1. Get info about source buffer
  size_t sourceSize = getHardwareBufferSize(sourceHardwareBuffer);

  // 2. Get info about the destination buffer
#ifdef NITRO_DEBUG
  size_t destinationSize = getHardwareBufferSize(sourceHardwareBuffer);
  if (sourceSize != destinationSize) {
    throw std::runtime_error("Source HardwareBuffer (" + std::to_string(sourceSize) + " bytes) and destination HardwareBuffer (" +
                             std::to_string(destinationSize) + " bytes) are not the same size!");
  }
#endif

  // 3. Copy data over
  void* sourceData;
  void* destinationData;
  int lockSource = AHardwareBuffer_lock(sourceHardwareBuffer, AHARDWAREBUFFER_USAGE_CPU_READ_OFTEN, -1, nullptr, &sourceData);
  if (lockSource != 0) {
    throw std::runtime_error("Failed to lock source HardwareBuffer! Error: " + std::to_string(lockSource));
  }
  int lockDestination =
      AHardwareBuffer_lock(destinationHardwareBuffer, AHARDWAREBUFFER_USAGE_CPU_WRITE_OFTEN, -1, nullptr, &destinationData);
  if (lockDestination != 0) {
    AHardwareBuffer_unlock(sourceHardwareBuffer, nullptr);
    throw std::runtime_error("Failed to lock destination HardwareBuffer! Error: " + std::to_string(lockDestination));
  }
  memcpy(destinationData, sourceData, sourceSize);
  AHardwareBuffer_unlock(sourceHardwareBuffer, nullptr);
  AHardwareBuffer_unlock(destinationHardwareBuffer, nullptr);
#else
  throw std::runtime_error("ArrayBuffer(HardwareBuffer) requires NDK API 26 or above! (minSdk >= 26)");
#endif
}

} // namespace margelo::nitro
