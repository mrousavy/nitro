//
// Created by Marc Rousavy on 18.11.24.
//

#pragma once

#include "ThreadPool.hpp"
#include "TypeInfo.hpp"
#include <exception>
#include <future>
#include <jsi/jsi.h>
#include <memory>
#include <variant>

namespace margelo::nitro {

using namespace facebook;

template <typename TResult, typename TError = std::exception>
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
  Promise() = default;

public:
  /**
   * Creates a Promise that runs the given function `run` on a separate Thread pool.
   */
  static std::shared_ptr<Promise> async(std::function<TResult()>&& run) {
    auto promise = std::make_shared<Promise>();
    ThreadPool::shared().run([run = std::move(run), promise]() {
      try {
        // Run the code, then resolve.
        TResult result = run();
        promise->resolve(std::move(result));
      } catch (const TError& exception) {
        // It threw an std::exception.
        promise->reject(exception);
      } catch (...) {
        // It threw a different error.
        std::string name = TypeInfo::getCurrentExceptionName();
        promise->reject(std::runtime_error("Unknown non-std error! Name: " + name));
      }
    });
    return promise;
  }

  /**
   * Creates a Promise and awaits the given future on a background Thread.
   * Once the future resolves or rejects, the Promise resolves or rejects.
   */
  static std::shared_ptr<Promise> awaitFuture(std::future<TResult>&& future) {
    auto sharedFuture = std::make_shared<std::future<TResult>>(std::move(future));
    return async([sharedFuture = std::move(sharedFuture)]() { return sharedFuture->get(); });
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
  inline const TResult& getResult() {
    if (!isResolved()) {
      throw std::runtime_error("Cannot get result when Promise is not yet resolved!");
    }
    return std::get<TResult>(_result);
  }
  /**
   * Get the error of the Promise if it has been rejected.
   * If the Promise is not rejected, this will throw.
   */
  inline const TError& getError() {
    if (!isRejected()) {
      throw std::runtime_error("Cannot get error when Promise is not yet rejected!");
    }
    return std::get<TError>(_result);
  }

public:
  /**
   * Gets whether this Promise has been successfuly resolved with a result, or not.
   */
  [[nodiscard]]
  inline bool isResolved() const noexcept {
    return std::holds_alternative<TResult>(_result);
  }
  /**
   * Gets whether this Promise has been rejected with an error, or not.
   */
  [[nodiscard]]
  inline bool isRejected() const noexcept {
    return std::holds_alternative<TError>(_result);
  }
  /**
   * Gets whether this Promise has not yet been resolved nor rejected.
   */
  [[nodiscard]]
  inline bool isPending() const noexcept {
    return std::holds_alternative<std::monostate>(_result);
  }

private:
  std::variant<std::monostate, TResult, TError> _result;
  std::vector<OnResolvedFunc> _onResolvedListeners;
  std::vector<OnRejectedFunc> _onRejectedListeners;
};

// Specialization for void
template <typename TError>
class Promise<void, TError> final {
public:
  using OnResolvedFunc = std::function<void()>;
  using OnRejectedFunc = std::function<void(const TError&)>;

public:
  Promise(const Promise&) = delete;
  Promise(Promise&&) = default;
  Promise() = default;

public:
  static std::shared_ptr<Promise> async(std::function<void()>&& run) {
    auto promise = std::make_shared<Promise>();
    ThreadPool::shared().run([run = std::move(run), promise]() {
      try {
        // Run the code, then resolve.
        run();
        promise->resolve();
      } catch (const TError& exception) {
        // It threw an std::exception.
        promise->reject(exception);
      } catch (...) {
        // It threw a different error.
        std::string name = TypeInfo::getCurrentExceptionName();
        promise->reject(std::runtime_error("Unknown non-std error! Name: " + name));
      }
    });
    return promise;
  }

  static std::shared_ptr<Promise> awaitFuture(std::future<void>&& future) {
    auto sharedFuture = std::make_shared<std::future<void>>(std::move(future));
    return async([sharedFuture = std::move(sharedFuture)]() { sharedFuture->get(); });
  }

  static std::shared_ptr<Promise> resolved() {
    auto promise = std::make_shared<Promise>();
    promise->resolve();
    return promise;
  }
  static std::shared_ptr<Promise> rejected(TError&& error) {
    auto promise = std::make_shared<Promise>();
    promise->reject(std::move(error));
    return promise;
  }

public:
  void resolve() {
    _isResolved = true;
    for (const auto& onResolved : _onResolvedListeners) {
      onResolved();
    }
  }
  void reject(TError&& exception) {
    _error = std::move(exception);
    for (const auto& onRejected : _onRejectedListeners) {
      onRejected(_error.value());
    }
  }
  void reject(const TError& exception) {
    _error = exception;
    for (const auto& onRejected : _onRejectedListeners) {
      onRejected(_error.value());
    }
  }

public:
  void addOnResolvedListener(OnResolvedFunc&& onResolved) {
    if (_isResolved) {
      onResolved();
    } else {
      _onResolvedListeners.push_back(std::move(onResolved));
    }
  }
  void addOnRejectedListener(OnRejectedFunc&& onRejected) {
    if (_error.has_value()) {
      onRejected(_error.value());
    } else {
      // Promise is not yet rejected, put the listener in our queue.
      _onRejectedListeners.push_back(std::move(onRejected));
    }
  }

public:
  inline const TError& getError() {
    if (!isRejected()) {
      throw std::runtime_error("Cannot get error when Promise is not yet rejected!");
    }
    return _error.value();
  }

public:
  [[nodiscard]]
  inline bool isResolved() const noexcept {
    return _isResolved;
  }
  [[nodiscard]]
  inline bool isRejected() const noexcept {
    return _error.has_value();
  }
  [[nodiscard]]
  inline bool isPending() const noexcept {
    return !isResolved() && !isRejected();
  }

private:
  bool _isResolved = false;
  std::optional<TError> _error;
  std::vector<OnResolvedFunc> _onResolvedListeners;
  std::vector<OnRejectedFunc> _onRejectedListeners;
};

} // namespace margelo::nitro
