
#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
class ArrayBuffer;
class JSICache;

template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"
#include "JSIConverter+ArrayBuffer.hpp"

#include "ArrayBuffer.hpp"
#include "CommonGlobals.hpp"
#include "JSICache.hpp"
#include "NitroDefines.hpp"
#include "TypedArray.hpp"
#include <jsi/jsi.h>
#include <memory>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

/**
 * JSIConverter for TypedArray<T>.
 *
 * Converts between C++ TypedArray<T> and JavaScript TypedArrays:
 * - TypedArray<double> <-> Float64Array
 * - TypedArray<float> <-> Float32Array
 * - TypedArray<int32_t> <-> Int32Array
 * - TypedArray<uint32_t> <-> Uint32Array
 * - TypedArray<int16_t> <-> Int16Array
 * - TypedArray<uint16_t> <-> Uint16Array
 * - TypedArray<int8_t> <-> Int8Array
 * - TypedArray<uint8_t> <-> Uint8Array
 * - TypedArray<int64_t> <-> BigInt64Array
 * - TypedArray<uint64_t> <-> BigUint64Array
 *
 * This enables efficient transfer of numeric arrays between JS and C++
 * by using the underlying ArrayBuffer (zero-copy when possible).
 */
template <typename T>
struct JSIConverter<TypedArray<T>> final {
  static constexpr const char* JSTypeName = getTypedArrayKindName(TypedArray<T>::kind);

  static inline TypedArray<T> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
#ifdef NITRO_DEBUG
    if (!arg.isObject()) [[unlikely]] {
      throw std::invalid_argument("Value \"" + arg.toString(runtime).utf8(runtime) + "\" is not a " + std::string(JSTypeName) +
                                  " - in fact, it's not even an object!");
    }
#endif

    jsi::Object object = arg.asObject(runtime);

#ifdef NITRO_DEBUG
    if (!CommonGlobals::TypedArray::isInstanceOf(runtime, object, JSTypeName)) [[unlikely]] {
      throw std::invalid_argument("Object \"" + arg.toString(runtime).utf8(runtime) + "\" is not a " + std::string(JSTypeName) + "!");
    }
#endif

    // Get the underlying ArrayBuffer
    jsi::Value bufferValue = CommonGlobals::TypedArray::getBuffer(runtime, object);
    jsi::Object bufferObject = bufferValue.asObject(runtime);

#ifdef NITRO_DEBUG
    if (!bufferObject.isArrayBuffer(runtime)) [[unlikely]] {
      throw std::invalid_argument("TypedArray's buffer is not an ArrayBuffer!");
    }
#endif

    // Get byte offset and length
    size_t byteOffset = CommonGlobals::TypedArray::getByteOffset(runtime, object);
    size_t length = CommonGlobals::TypedArray::getLength(runtime, object);

    // Get the ArrayBuffer using existing converter
    auto arrayBuffer = JSIConverter<std::shared_ptr<ArrayBuffer>>::fromJSI(runtime, bufferValue);

    // If there's a byte offset, we need to create a view into the buffer
    if (byteOffset > 0) {
      // Create a new ArrayBuffer that points to the correct offset
      // We copy the data since we can't easily create a view with offset
      size_t byteLength = length * sizeof(T);
      auto data = arrayBuffer->data() + byteOffset;
      return TypedArray<T>::fromData(reinterpret_cast<const T*>(data), length);
    }

    return TypedArray<T>(std::move(arrayBuffer));
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const TypedArray<T>& typedArray) {
    if (typedArray.empty()) {
      // Create an empty TypedArray
      auto emptyBuffer = ArrayBuffer::allocate(0);
      jsi::Value bufferValue = JSIConverter<std::shared_ptr<ArrayBuffer>>::toJSI(runtime, emptyBuffer);
      return CommonGlobals::TypedArray::create(runtime, JSTypeName, bufferValue);
    }

    // Convert the underlying ArrayBuffer to JS
    jsi::Value bufferValue = JSIConverter<std::shared_ptr<ArrayBuffer>>::toJSI(runtime, typedArray.buffer());

    // Create the TypedArray from the ArrayBuffer
    return CommonGlobals::TypedArray::create(runtime, JSTypeName, bufferValue);
  }

  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) {
      return false;
    }
    jsi::Object object = value.getObject(runtime);
    return CommonGlobals::TypedArray::isInstanceOf(runtime, object, JSTypeName);
  }
};

} // namespace margelo::nitro

