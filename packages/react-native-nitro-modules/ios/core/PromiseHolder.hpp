//
//  PromiseHolder.hpp
//  Pods
//
//  Created by Marc Rousavy on 15.08.24.
//

#pragma once

#include <future>
#include <string>

namespace margelo::nitro {

/**
 * Holds a `std::promise` that can be accessed from Swift using proper ref management.
 */
template <typename T>
class PromiseHolder {
public:
  /**
   * Create a new PromiseHolder (and a new `std::promise<T>`).
   */
  explicit PromiseHolder() {
    _promise = std::make_shared<std::promise<T>>();
  }
  
  /**
   * Resolve the underlying `std::promise<T>` with `T`.
   */
  void resolve(const T& result) const {
    _promise->set_value(result);
  }
  
  /**
   * Reject the underlying `std::promise<T>` with the given message.
   */
  void reject(const std::string& message) const {
    try {
      throw std::runtime_error(message);
    } catch (...) {
      _promise->set_exception(std::current_exception());
    }
  }
  
  /**
   * Get the `std::future<T>` of the underlying `std::promise<T>`.
   * This can only be called once.
   */
  std::future<T> getFuture() { return _promise->get_future(); }
  
private:
  std::shared_ptr<std::promise<T>> _promise;
};

// Specialization for `void` (no args to `resolve()`)
template<>
class PromiseHolder<void> {
public:
  explicit PromiseHolder() {
    _promise = std::make_shared<std::promise<void>>();
  }
  
  void resolve() const {
    _promise->set_value();
  }
  
  void reject(const std::string& message) const {
    try {
      throw std::runtime_error(message);
    } catch (...) {
      _promise->set_exception(std::current_exception());
    }
  }
  
  std::future<void> getFuture() { return _promise->get_future(); }
  
private:
  std::shared_ptr<std::promise<void>> _promise;
};

} // namespace margelo::nitro
