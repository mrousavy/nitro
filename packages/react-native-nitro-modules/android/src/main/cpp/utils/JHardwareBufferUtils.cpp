//
//  JHardwareBufferUtils.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 11.07.25.
//

#include "JHardwareBufferUtils.hpp"
#include "NitroDefines.hpp"
#include "SafeHardwareBuffer.hpp"
#include <android/hardware_buffer_jni.h>

namespace margelo::nitro {

void JHardwareBufferUtils::copyBoxedHardwareBufferIntoExistingBoxedHardwareBuffer(
    jni::alias_ref<jni::JClass>, [[maybe_unused]] jni::alias_ref<jni::JObject> boxedSourceHardwareBuffer,
    [[maybe_unused]] jni::alias_ref<jni::JObject> boxedDestinationHardwareBuffer) {
  // 1. Unbox HardwareBuffer from jobject
  SafeHardwareBuffer source = SafeHardwareBuffer::fromJava(boxedSourceHardwareBuffer);
  SafeHardwareBuffer destination = SafeHardwareBuffer::fromJava(boxedDestinationHardwareBuffer);
  // 2. Copy AHardwareBuffer* data from source -> destination
  copyHardwareBuffer(source.getHardwareBuffer(), destination.getHardwareBuffer());
}

jni::local_ref<jni::JObject>
JHardwareBufferUtils::copyBoxedHardwareBufferIntoNewBoxedHardwareBuffer(jni::alias_ref<jni::JClass>,
                                                                        [[maybe_unused]] jni::alias_ref<jni::JObject> boxedHardwareBuffer) {

  // 1. Unbox HardwareBuffer from jobject
  SafeHardwareBuffer source = SafeHardwareBuffer::fromJava(boxedHardwareBuffer);
  // 2. Get source buffer info
  AHardwareBuffer_Desc description = source.describe();
  // 3. Allocate new destination buffer
  SafeHardwareBuffer destination = SafeHardwareBuffer::allocate(&description);
  // 4. Copy data over
  copyHardwareBuffer(source.getBuffer(), destination.getBuffer());
  // 5. Box it & return to Java
  return destination.toJava();
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

  // 3. Lock both buffers and get their data pointers
  void* sourceData;
  void* destinationData;
  int lockSource = AHardwareBuffer_lock(sourceHardwareBuffer, AHARDWAREBUFFER_USAGE_CPU_READ_MASK, -1, nullptr, &sourceData);
  if (lockSource != 0) {
    throw std::runtime_error("Failed to lock source HardwareBuffer! Error: " + std::to_string(lockSource));
  }
  int lockDestination =
      AHardwareBuffer_lock(destinationHardwareBuffer, AHARDWAREBUFFER_USAGE_CPU_WRITE_MASK, -1, nullptr, &destinationData);
  if (lockDestination != 0) {
    AHardwareBuffer_unlock(sourceHardwareBuffer, nullptr);
    throw std::runtime_error("Failed to lock destination HardwareBuffer! Error: " + std::to_string(lockDestination));
  }
  // 4. Copy data over via memcpy
  memcpy(destinationData, sourceData, sourceSize);
  // 5. Unlock both buffers again
  AHardwareBuffer_unlock(sourceHardwareBuffer, nullptr);
  AHardwareBuffer_unlock(destinationHardwareBuffer, nullptr);
#else
  throw HardwareBuffersUnavailable();
#endif
}

} // namespace margelo::nitro
