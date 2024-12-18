//
//  Result.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 18.12.24.
//

#pragma once

#include <exception>
#include <new>
#include <type_traits>
#include <utility>

namespace margelo::nitro {

template <class T>
class Result {
public:
  static Result withValue(const T& v) {
    Result r;
    r._constructValue(v);
    return r;
  }

  static Result withValue(T&& v) {
    Result r;
    r._constructValue(std::move(v));
    return r;
  }

  static Result withError(std::exception_ptr e) {
    Result r;
    r._constructError(std::move(e));
    return r;
  }

  Result() noexcept : _hasValue(false) {}

  Result(const Result& other) {
    if (other._hasValue) {
      _constructValue(other.value());
    } else {
      _constructError(other.error());
    }
  }

  Result(Result&& other) noexcept(std::is_nothrow_move_constructible<T>::value) {
    if (other._hasValue) {
      _constructValue(std::move(other._value));
    } else {
      _constructError(std::move(other._error));
    }
  }

  Result& operator=(const Result& other) {
    if (this != &other) {
      _destroy();
      if (other._hasValue) {
        _constructValue(other.value());
      } else {
        _constructError(other.error());
      }
    }
    return *this;
  }

  Result& operator=(Result&& other) noexcept(std::is_nothrow_move_constructible<T>::value) {
    if (this != &other) {
      _destroy();
      if (other._hasValue) {
        _constructValue(std::move(other._value));
      } else {
        _constructError(std::move(other._error));
      }
    }
    return *this;
  }

  ~Result() {
    _destroy();
  }

  bool hasValue() const noexcept {
    return _hasValue;
  }
  explicit operator bool() const noexcept {
    return hasValue();
  }

  T& value() & {
    return _value;
  }

  const T& value() const& {
    return _value;
  }

  T&& value() && {
    return std::move(_value);
  }

  const std::exception_ptr& error() const& {
    return _error;
  }

  std::exception_ptr&& error() && {
    return std::move(_error);
  }

private:
  bool _hasValue;
  union {
    T _value;
    std::exception_ptr _error;
  };

  template <class... Args>
  void _constructValue(Args&&... args) {
    ::new (static_cast<void*>(&_value)) T(std::forward<Args>(args)...);
    _hasValue = true;
  }

  void _constructError(std::exception_ptr e) {
    ::new (static_cast<void*>(&_error)) std::exception_ptr(std::move(e));
    _hasValue = false;
  }

  void _destroy() noexcept {
    if (_hasValue) {
      _value.~T();
    } else {
      _error.~exception_ptr();
    }
  }
};

template <>
class Result<void> {
public:
  static Result withValue() {
    Result r;
    r._hasValue = true;
    return r;
  }

  static Result withError(std::exception_ptr e) {
    Result r;
    r._constructError(std::move(e));
    return r;
  }

  Result() noexcept : _hasValue(false) {}

  Result(const Result& other) {
    if (other._hasValue) {
      _hasValue = true;
    } else {
      _constructError(other.error());
    }
  }

  Result(Result&& other) noexcept {
    if (other._hasValue) {
      _hasValue = true;
    } else {
      _constructError(std::move(other._error));
    }
  }

  Result& operator=(const Result& other) {
    if (this != &other) {
      _destroy();
      if (other._hasValue) {
        _hasValue = true;
      } else {
        _constructError(other.error());
      }
    }
    return *this;
  }

  Result& operator=(Result&& other) noexcept {
    if (this != &other) {
      _destroy();
      if (other._hasValue) {
        _hasValue = true;
      } else {
        _constructError(std::move(other._error));
      }
    }
    return *this;
  }

  ~Result() {
    _destroy();
  }

  bool hasValue() const noexcept {
    return _hasValue;
  }
  explicit operator bool() const noexcept {
    return hasValue();
  }

  void value() const {
    // Nothing to return, but ensure we have value
  }

  const std::exception_ptr& error() const& {
    return _error;
  }

  std::exception_ptr&& error() && {
    return std::move(_error);
  }

private:
  bool _hasValue;
  std::exception_ptr _error;

  void _constructError(std::exception_ptr e) {
    ::new (static_cast<void*>(&_error)) std::exception_ptr(std::move(e));
    _hasValue = false;
  }

  void _destroy() noexcept {
    if (!_hasValue) {
      _error.~exception_ptr();
    }
  }
};

} // namespace margelo::nitro
