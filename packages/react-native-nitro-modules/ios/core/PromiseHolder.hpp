//
//  PromiseHolder.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 19.12.24.
//

#pragma once

#include "Promise.hpp"
#include <memory>
#include <swift/bridging>

namespace margelo::nitro {

using namespace facebook;

/**
 * Holds instances of `std::shared_ptr<Promise<T>>`.
 * This exists to avoid expensive copies of `Promise<T>`.
 */
template <typename T>
class PromiseHolder<T> {
public:
  PromiseHolder(const std::shared_ptr<Promise<T>>& promise) : _promise(promise) {}

public:
  void resolve(T value) {
    _promise->resolve(std::move(value));
  }

  void reject(const std::exception_ptr& exception) {
    _promise->reject(exception);
  }

public:
  inline const std::shared_ptr<Promise<T>>& getPromise() const {
    return _promise;
  }

private:
  std::shared_ptr<Promise<T>> _promise;
};

} // namespace margelo::nitro
