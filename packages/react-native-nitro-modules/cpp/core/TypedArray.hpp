//
//  TypedArray.hpp
//  NitroModules
//
//  Created for performance optimization of numeric arrays.
//

#pragma once

#include "ArrayBuffer.hpp"
#include "NitroDefines.hpp"
#include <cstdint>
#include <cstring>
#include <memory>
#include <span>
#include <vector>

namespace margelo::nitro {

/**
 * Enum representing JavaScript TypedArray types.
 */
enum class TypedArrayKind {
  Int8Array,
  Uint8Array,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  BigInt64Array,
  BigUint64Array
};

/**
 * Get the TypedArray kind name as a string (for JS constructor lookup).
 */
constexpr const char* getTypedArrayKindName(TypedArrayKind kind) {
  switch (kind) {
    case TypedArrayKind::Int8Array:
      return "Int8Array";
    case TypedArrayKind::Uint8Array:
      return "Uint8Array";
    case TypedArrayKind::Int16Array:
      return "Int16Array";
    case TypedArrayKind::Uint16Array:
      return "Uint16Array";
    case TypedArrayKind::Int32Array:
      return "Int32Array";
    case TypedArrayKind::Uint32Array:
      return "Uint32Array";
    case TypedArrayKind::Float32Array:
      return "Float32Array";
    case TypedArrayKind::Float64Array:
      return "Float64Array";
    case TypedArrayKind::BigInt64Array:
      return "BigInt64Array";
    case TypedArrayKind::BigUint64Array:
      return "BigUint64Array";
  }
}

/**
 * Type trait to map C++ types to TypedArrayKind.
 */
template <typename T>
struct TypedArrayKindFor;

template <>
struct TypedArrayKindFor<int8_t> {
  static constexpr TypedArrayKind value = TypedArrayKind::Int8Array;
};
template <>
struct TypedArrayKindFor<uint8_t> {
  static constexpr TypedArrayKind value = TypedArrayKind::Uint8Array;
};
template <>
struct TypedArrayKindFor<int16_t> {
  static constexpr TypedArrayKind value = TypedArrayKind::Int16Array;
};
template <>
struct TypedArrayKindFor<uint16_t> {
  static constexpr TypedArrayKind value = TypedArrayKind::Uint16Array;
};
template <>
struct TypedArrayKindFor<int32_t> {
  static constexpr TypedArrayKind value = TypedArrayKind::Int32Array;
};
template <>
struct TypedArrayKindFor<uint32_t> {
  static constexpr TypedArrayKind value = TypedArrayKind::Uint32Array;
};
template <>
struct TypedArrayKindFor<float> {
  static constexpr TypedArrayKind value = TypedArrayKind::Float32Array;
};
template <>
struct TypedArrayKindFor<double> {
  static constexpr TypedArrayKind value = TypedArrayKind::Float64Array;
};
template <>
struct TypedArrayKindFor<int64_t> {
  static constexpr TypedArrayKind value = TypedArrayKind::BigInt64Array;
};
template <>
struct TypedArrayKindFor<uint64_t> {
  static constexpr TypedArrayKind value = TypedArrayKind::BigUint64Array;
};

/**
 * A typed array that wraps an ArrayBuffer and provides typed element access.
 * This maps directly to JavaScript TypedArrays (Float64Array, Int32Array, etc.)
 * and enables zero-copy or fast memcpy operations for numeric data.
 *
 * @tparam T The element type (int8_t, uint8_t, int16_t, uint16_t, int32_t, uint32_t, float, double, int64_t, uint64_t)
 *
 * @example
 * ```cpp
 * // Create from vector (copies data once via memcpy)
 * std::vector<double> data = {1.0, 2.0, 3.0};
 * auto typedArray = TypedArray<double>::fromVector(data);
 *
 * // Access elements
 * double first = typedArray[0];
 * size_t count = typedArray.size();
 *
 * // Get as span for iteration
 * for (double value : typedArray.data()) {
 *   // ...
 * }
 * ```
 */
template <typename T>
class TypedArray final {
  static_assert(std::is_arithmetic_v<T>, "TypedArray element type must be a numeric type");

public:
  /**
   * The TypedArrayKind for this TypedArray's element type.
   */
  static constexpr TypedArrayKind kind = TypedArrayKindFor<T>::value;

  /**
   * Creates an empty TypedArray.
   */
  TypedArray() : _buffer(ArrayBuffer::allocate(0)), _size(0) {}

  /**
   * Creates a TypedArray that wraps an existing ArrayBuffer.
   * The buffer's size must be a multiple of sizeof(T).
   */
  explicit TypedArray(std::shared_ptr<ArrayBuffer> buffer) : _buffer(std::move(buffer)) {
    if (_buffer == nullptr) {
      _size = 0;
    } else {
      size_t byteLength = _buffer->size();
      if (byteLength % sizeof(T) != 0) [[unlikely]] {
        throw std::runtime_error("ArrayBuffer size (" + std::to_string(byteLength) + " bytes) is not a multiple of element size (" +
                                 std::to_string(sizeof(T)) + " bytes)!");
      }
      _size = byteLength / sizeof(T);
    }
  }

  /**
   * Creates a TypedArray with the given number of elements.
   * Elements are zero-initialized.
   */
  static TypedArray allocate(size_t elementCount) {
    size_t byteLength = elementCount * sizeof(T);
    auto buffer = ArrayBuffer::allocate(byteLength);
    std::memset(buffer->data(), 0, byteLength);
    return TypedArray(std::move(buffer));
  }

  /**
   * Creates a TypedArray by copying data from a vector.
   * This performs a single memcpy operation.
   */
  static TypedArray fromVector(const std::vector<T>& vector) {
    size_t byteLength = vector.size() * sizeof(T);
    auto buffer = ArrayBuffer::allocate(byteLength);
    std::memcpy(buffer->data(), vector.data(), byteLength);
    TypedArray result(std::move(buffer));
    return result;
  }

  /**
   * Creates a TypedArray by moving data from a vector.
   */
  static TypedArray fromVector(std::vector<T>&& vector) {
    size_t size = vector.size();
    auto buffer = ArrayBuffer::move(std::move(reinterpret_cast<std::vector<uint8_t>&>(vector)));
    TypedArray result;
    result._buffer = std::move(buffer);
    result._size = size;
    return result;
  }

  /**
   * Creates a TypedArray by copying raw data.
   */
  static TypedArray fromData(const T* data, size_t elementCount) {
    size_t byteLength = elementCount * sizeof(T);
    auto buffer = ArrayBuffer::copy(reinterpret_cast<const uint8_t*>(data), byteLength);
    return TypedArray(std::move(buffer));
  }

  /**
   * Creates a TypedArray by wrapping raw data without copying.
   * The caller is responsible for ensuring the data remains valid.
   */
  static TypedArray wrap(T* data, size_t elementCount, DeleteFn&& deleteFn) {
    size_t byteLength = elementCount * sizeof(T);
    auto buffer = ArrayBuffer::wrap(reinterpret_cast<uint8_t*>(data), byteLength, std::move(deleteFn));
    return TypedArray(std::move(buffer));
  }

public:
  /**
   * Returns the number of elements in the TypedArray.
   */
  [[nodiscard]] size_t size() const noexcept {
    return _size;
  }

  /**
   * Returns the size in bytes.
   */
  [[nodiscard]] size_t byteLength() const noexcept {
    return _size * sizeof(T);
  }

  /**
   * Returns whether the TypedArray is empty.
   */
  [[nodiscard]] bool empty() const noexcept {
    return _size == 0;
  }

  /**
   * Returns a pointer to the typed data.
   */
  [[nodiscard]] T* data() noexcept {
    if (_buffer == nullptr) return nullptr;
    return reinterpret_cast<T*>(_buffer->data());
  }

  /**
   * Returns a const pointer to the typed data.
   */
  [[nodiscard]] const T* data() const noexcept {
    if (_buffer == nullptr) return nullptr;
    return reinterpret_cast<const T*>(_buffer->data());
  }

  /**
   * Returns a span over the typed data.
   */
  [[nodiscard]] std::span<T> span() noexcept {
    return std::span<T>(data(), _size);
  }

  /**
   * Returns a const span over the typed data.
   */
  [[nodiscard]] std::span<const T> span() const noexcept {
    return std::span<const T>(data(), _size);
  }

  /**
   * Returns the underlying ArrayBuffer.
   */
  [[nodiscard]] const std::shared_ptr<ArrayBuffer>& buffer() const noexcept {
    return _buffer;
  }

  /**
   * Converts the TypedArray to a vector by copying.
   */
  [[nodiscard]] std::vector<T> toVector() const {
    if (_size == 0) return {};
    std::vector<T> result(_size);
    std::memcpy(result.data(), data(), byteLength());
    return result;
  }

  /**
   * Element access with bounds checking.
   */
  [[nodiscard]] T& at(size_t index) {
    if (index >= _size) [[unlikely]] {
      throw std::out_of_range("TypedArray index " + std::to_string(index) + " out of range (size: " + std::to_string(_size) + ")");
    }
    return data()[index];
  }

  /**
   * Element access with bounds checking (const).
   */
  [[nodiscard]] const T& at(size_t index) const {
    if (index >= _size) [[unlikely]] {
      throw std::out_of_range("TypedArray index " + std::to_string(index) + " out of range (size: " + std::to_string(_size) + ")");
    }
    return data()[index];
  }

  /**
   * Element access without bounds checking.
   */
  [[nodiscard]] T& operator[](size_t index) noexcept {
    return data()[index];
  }

  /**
   * Element access without bounds checking (const).
   */
  [[nodiscard]] const T& operator[](size_t index) const noexcept {
    return data()[index];
  }

  // Iterator support
  [[nodiscard]] T* begin() noexcept {
    return data();
  }
  [[nodiscard]] T* end() noexcept {
    return data() + _size;
  }
  [[nodiscard]] const T* begin() const noexcept {
    return data();
  }
  [[nodiscard]] const T* end() const noexcept {
    return data() + _size;
  }

private:
  std::shared_ptr<ArrayBuffer> _buffer;
  size_t _size;
};

// Convenient type aliases
using Int8Array = TypedArray<int8_t>;
using Uint8Array = TypedArray<uint8_t>;
using Int16Array = TypedArray<int16_t>;
using Uint16Array = TypedArray<uint16_t>;
using Int32Array = TypedArray<int32_t>;
using Uint32Array = TypedArray<uint32_t>;
using Float32Array = TypedArray<float>;
using Float64Array = TypedArray<double>;
using BigInt64Array = TypedArray<int64_t>;
using BigUint64Array = TypedArray<uint64_t>;

} // namespace margelo::nitro

