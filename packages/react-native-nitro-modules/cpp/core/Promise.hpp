//
// Created by Marc Rousavy on 18.11.24.
//

#pragma once

#include <jsi/jsi.h>
#include <memory>
#include <variant>
#include <exception>
#include "ThreadPool.hpp"

namespace margelo::nitro {

using namespace facebook;

template<typename TResult, typename TError = std::exception>
class Promise final {
public:
  using OnResolvedFunc = std::function<void(const TResult&)>;
  using OnRejectedFunc = std::function<void(const TError&)>;

public:
  // Promise cannot be deleted.
  Promise(const Promise&) = delete;
  // Promise can be moved.
  Promise(Promise&&) = default;

  /**
   * Creates a new pending Promise that has to be resolved
   * or rejected with `resolve(..)` or `reject(..)`.
   */
  Promise() {}
  
public:
  /**
   * Creates a Promise that runs the given function `run` on a separate Thread pool.
   */
  static std::shared_ptr<Promise> async(std::function<TResult()>&& run) {
    auto promise = std::make_shared<Promise>();
    ThreadPool::getSharedPool()->run([run = std::move(run), promise]() {
      try {
        TResult result = run();
        promise->resolve(std::move(result));
      } catch (const TError& exception) {
        promise->reject(exception);
      }
    });
    return promise;
  }
  
  /**
   * Creates an immediately resolved Promise.
   */
  static std::shared_ptr<Promise> resolved(TResult&& result) {
    auto promise = std::make_shared<Promise>();
    promise->resolve(std::move(result));
    return promise;
  }
  /**
   * Creates an immediately rejected Promise.
   */
  static std::shared_ptr<Promise> rejected(TError&& error) {
    auto promise = std::make_shared<Promise>();
    promise->reject(std::move(error));
    return promise;
  }

public:
  /**
   * Resolves this Promise with the given result, and calls any pending listeners.
   */
  void resolve(TResult&& result) {
    _result = std::move(result);
    for (const auto& onResolved : _onResolvedListeners) {
      onResolved(std::get<TResult>(_result));
    }
  }
  void resolve(const TResult& result) {
    _result = result;
    for (const auto& onResolved : _onResolvedListeners) {
      onResolved(std::get<TResult>(_result));
    }
  }
  /**
   * Rejects this Promise with the given error, and calls any pending listeners.
   */
  void reject(TError&& exception) {
    _result = std::move(exception);
    for (const auto& onRejected : _onRejectedListeners) {
      onRejected(std::get<TError>(_result));
    }
  }
  void reject(const TError& exception) {
    _result = exception;
    for (const auto& onRejected : _onRejectedListeners) {
      onRejected(std::get<TError>(_result));
    }
  }

public:
  /**
   * Add a listener that will be called when the Promise gets resolved.
   * If the Promise is already resolved, the listener will be immediately called.
   */
  void addOnResolvedListener(OnResolvedFunc&& onResolved) {
    if (std::holds_alternative<TResult>(_result)) {
      // Promise is already resolved! Call the callback immediately
      onResolved(std::get<TResult>(_result));
    } else {
      // Promise is not yet resolved, put the listener in our queue.
      _onResolvedListeners.push_back(std::move(onResolved));
    }
  }
  /**
   * Add a listener that will be called when the Promise gets rejected.
   * If the Promise is already rejected, the listener will be immediately called.
   */
  void addOnRejectedListener(OnRejectedFunc&& onRejected) {
    if (std::holds_alternative<TError>(_result)) {
      // Promise is already rejected! Call the callback immediately
      onRejected(std::get<TError>(_result));
    } else {
      // Promise is not yet rejected, put the listener in our queue.
      _onRejectedListeners.push_back(std::move(onRejected));
    }
  }
  
public:
  /**
   * Get the result of the Promise if it has been resolved.
   * If the Promise is not resolved, this will throw.
   */
  inline const TResult& getResult() const {
    if (!isResolved()) {
      throw std::runtime_error("Cannot get result when Promise is not yet resolved!");
    }
    return std::get<TResult>(_result);
  }
  /**
   * Get the error of the Promise if it has been rejected.
   * If the Promise is not rejected, this will throw.
   */
  inline const TResult& getError() const {
    if (!isRejected()) {
      throw std::runtime_error("Cannot get error when Promise is not yet rejected!");
    }
    return std::get<TError>(_result);
  }

public:
  /**
   * Gets whether this Promise has been successfuly resolved with a result, or not.
   */
  inline bool isResolved() const noexcept {
    return std::holds_alternative<TResult>(_result);
  }
  /**
   * Gets whether this Promise has been rejected with an error, or not.
   */
  inline bool isRejected() const noexcept {
    return std::holds_alternative<TError>(_result);
  }
  /**
   * Gets whether this Promise has not yet been resolved nor rejected.
   */
  inline bool isPending() const noexcept {
    return std::holds_alternative<std::monostate>(_result);
  }

private:
  std::variant<std::monostate, TResult, TError> _result;
  std::vector<OnResolvedFunc> _onResolvedListeners;
  std::vector<OnRejectedFunc> _onRejectedListeners;
};

} // namespace margelo::nitro
