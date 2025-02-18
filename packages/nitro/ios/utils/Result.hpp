#pragma once

#include <exception>
#include <new>
#include <type_traits>
#include <utility>

namespace margelo::nitro {

// TODO: Remove this whole Result wrapping system once Swift errors can be caught in C++.
//       See https://github.com/swiftlang/swift/issues/75290

/**
 * Represents a Result from a function. It's either a value (`T`), or an error (`std::exception_ptr`).
 */
template <typename T>
class Result {
public:
  // Constructors
  Result(const Result& other) : _hasError(other._hasError) {
    if (_hasError) {
      new (&_error) std::exception_ptr(other._error);
    } else {
      new (&_storage) T(other.value());
    }
  }

  Result(Result&& other) noexcept(std::is_nothrow_move_constructible<T>::value) : _hasError(other._hasError) {
    if (_hasError) {
      new (&_error) std::exception_ptr(std::move(other._error));
    } else {
      new (&_storage) T(std::move(other.value()));
    }
  }

  ~Result() {
    destroy();
  }

  Result& operator=(const Result& other) {
    if (this == &other)
      return *this;
    destroy();
    _hasError = other._hasError;
    if (_hasError) {
      new (&_error) std::exception_ptr(other._error);
    } else {
      new (&_storage) T(other.value());
    }
    return *this;
  }

  Result& operator=(Result&& other) noexcept(std::is_nothrow_move_constructible<T>::value) {
    if (this == &other)
      return *this;
    destroy();
    _hasError = other._hasError;
    if (_hasError) {
      new (&_error) std::exception_ptr(std::move(other._error));
    } else {
      new (&_storage) T(std::move(other.value()));
    }
    return *this;
  }

  // Static factories
  static Result withValue(const T& value) {
    return Result(value);
  }

  static Result withValue(T&& value) {
    return Result(std::move(value));
  }

  static Result withError(std::exception_ptr eptr) {
    return Result(eptr);
  }

  // Accessors
  bool hasValue() const noexcept {
    return !_hasError;
  }

  bool hasError() const noexcept {
    return _hasError;
  }

  const T& value() const {
    assert(!_hasError && "Result<T> does not hold a value!");
    return *reinterpret_cast<const T*>(&_storage);
  }

  T& value() {
    assert(!_hasError && "Result<T> does not hold a value!");
    return *reinterpret_cast<T*>(&_storage);
  }

  std::exception_ptr error() const {
    assert(_hasError && "Result<T> does not hold an error!");
    return _error;
  }

private:
  // Private constructors
  explicit Result(const T& value) : _hasError(false) {
    new (&_storage) T(value);
  }

  explicit Result(T&& value) : _hasError(false) {
    new (&_storage) T(std::move(value));
  }

  explicit Result(std::exception_ptr eptr) : _hasError(true) {
    new (&_error) std::exception_ptr(eptr);
  }

  void destroy() {
    if (_hasError) {
      reinterpret_cast<std::exception_ptr*>(&_error)->~exception_ptr();
    } else {
      reinterpret_cast<T*>(&_storage)->~T();
    }
  }

private:
  bool _hasError;
  union {
    typename std::aligned_storage<sizeof(T), alignof(T)>::type _storage;
    std::exception_ptr _error;
  };
};

// Specialization for void
template <>
class Result<void> {
public:
  // Constructors
  Result(const Result& other) : _hasError(other._hasError), _error(other._error) {}

  Result(Result&& other) noexcept : _hasError(other._hasError), _error(std::move(other._error)) {}

  Result& operator=(const Result& other) {
    if (this == &other)
      return *this;
    _hasError = other._hasError;
    if (_hasError) {
      _error = other._error;
    }
    return *this;
  }

  Result& operator=(Result&& other) noexcept {
    if (this == &other)
      return *this;
    _hasError = other._hasError;
    if (_hasError) {
      _error = std::move(other._error);
    }
    return *this;
  }

  // Static factories
  static Result withValue() {
    return Result();
  }

  static Result withError(std::exception_ptr eptr) {
    return Result(eptr);
  }

  bool hasValue() const noexcept {
    return !_hasError;
  }

  bool hasError() const noexcept {
    return _hasError;
  }

  std::exception_ptr error() const {
    assert(_hasError && "Result<void> does not hold an error!");
    return _error;
  }

private:
  explicit Result() : _hasError(false), _error(nullptr) {}
  explicit Result(std::exception_ptr error) : _hasError(true), _error(error) {}

private:
  bool _hasError;
  std::exception_ptr _error;
};

} // namespace margelo::nitro
