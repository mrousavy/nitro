//
//  ArrayBufferHolder.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.08.24.
//

#pragma once

#include "NitroDefines.hpp"
#include "Promise.hpp"
#include <exception>
#include <memory>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

/**
 * Holds instances of `std::shared_ptr<Promise<T>>`.
 * The reason this exists is for performance optimizations, as well as easier listeners for Swift.
 */
template <typename T>
class PromiseHolder<T> final {
public:
  PromiseHolder(const std::shared_ptr<Promise<T>>& promise) : _promise(promise) {}

public:
  static PromiseHolder create() {
    return PromiseHolder(Promise<T>::create());
  }

public:
  template <typename U = T>
  typename std::enable_if<!std::is_void<U>::value, void>::type resolve(U value) {
    _promise->resolve(std::move(value));
  }
  template <typename U = T>
  typename std::enable_if<std::is_void<U>::value, void>::type resolve() {
    _promise->resolve();
  }

  void reject(const std::exception_ptr& exception) {
    _promise->reject(exception);
  }

public:
  void addOnResolvedListener(const std::function<void(T)>& onResolved) {
    _promise->addOnResolvedListener([=](const T& result) { onResolved(result); });
  }

  void addOnRejectedListener(const std::function<void(std::exception_ptr)>& onRejected) {
    _promise->addOnResolvedListener([=](const std::exception_ptr& error) { onRejected(error); });
  }

public:
  inline std::shared_ptr<Promise<T>> getPromise() const {
    return _promise;
  }

private:
  std::shared_ptr<Promise<T>> _promise;
} SWIFT_NONCOPYABLE;

} // namespace margelo::nitro
