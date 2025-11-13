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
  copyHardwareBuffer(source, destination);
}

jni::local_ref<jni::JObject>
JHardwareBufferUtils::copyBoxedHardwareBufferIntoNewBoxedHardwareBuffer(jni::alias_ref<jni::JClass>,
                                                                        [[maybe_unused]] jni::alias_ref<jni::JObject> boxedHardwareBuffer) {

  // 1. Unbox HardwareBuffer from jobject
  SafeHardwareBuffer source = SafeHardwareBuffer::fromJava(boxedHardwareBuffer);
  // 2. Get source buffer info
  AHardwareBuffer_Desc description = source.describe();
  // 3. Allocate new destination buffer
  SafeHardwareBuffer destination = SafeHardwareBuffer::allocate(description);
  // 4. Copy data over
  copyHardwareBuffer(source, destination);
  // 5. Box it & return to Java
  return destination.toJava();
}

void JHardwareBufferUtils::copyHardwareBuffer(SafeHardwareBuffer& source, SafeHardwareBuffer& destination) {
  // 1. Get info about source buffer
  size_t sourceSize = source.size();

  // 2. Get info about the destination buffer
#ifdef NITRO_DEBUG
  size_t destinationSize = destination.size();
  if (sourceSize != destinationSize) {
    throw std::runtime_error("Source HardwareBuffer (" + std::to_string(sourceSize) + " bytes) and destination HardwareBuffer (" +
                             std::to_string(destinationSize) + " bytes) are not the same size!");
  }
#endif

  // 3. Lock both buffers and get their data pointers
  void* sourceData = source.data(LockFlag::READ);
  void* destinationData = destination.data(LockFlag::WRITE);
  // 4. Copy data over via memcpy
  memcpy(destinationData, sourceData, sourceSize);
  // 5. Unlock both buffers again
  source.unlock();
  destination.unlock();
}

} // namespace margelo::nitro
