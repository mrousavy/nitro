//
//  Promise.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 18.11.24.
//

#include "Promise.hpp"

namespace margelo::nitro {

Promise<void>::~Promise() {
  if (isPending()) [[unlikely]] {
    std::runtime_error error("Timeouted: Promise<void> was destroyed!");
    reject(std::make_exception_ptr(error));
  }
}

std::shared_ptr<Promise<void>> Promise<void>::create() {
  return std::shared_ptr<Promise<void>>(new Promise());
}

std::shared_ptr<Promise<void>> Promise<void>::async(std::function<void()>&& run) {
  auto promise = create();
  ThreadPool::shared().run([run = std::move(run), promise]() {
    try {
      // Run the code, then resolve.
      run();
      promise->resolve();
    } catch (...) {
      // It threw an error.
      promise->reject(std::current_exception());
    }
  });
  return promise;
}

std::shared_ptr<Promise<void>> Promise<void>::awaitFuture(std::future<void>&& future) {
  auto sharedFuture = std::make_shared<std::future<void>>(std::move(future));
  return async([sharedFuture = std::move(sharedFuture)]() { sharedFuture->get(); });
}

std::shared_ptr<Promise<void>> Promise<void>::resolved() {
  auto promise = create();
  promise->resolve();
  return promise;
}
std::shared_ptr<Promise<void>> Promise<void>::rejected(const std::exception_ptr& error) {
  auto promise = create();
  promise->reject(error);
  return promise;
}

void Promise<void>::resolve() {
#ifdef NITRO_DEBUG
  assertPromiseState(*this, PromiseTask::WANTS_TO_RESOLVE);
#endif
  std::vector<OnResolvedFunc> listeners;
  {
    std::unique_lock lock(_mutex);
    _isResolved = true;
    listeners = takeResolvedListenersAndClearAllListeners(lock);
  }
  for (const auto& onResolved : listeners) {
    onResolved();
  }
}

void Promise<void>::reject(const std::exception_ptr& exception) {
  if (exception == nullptr) [[unlikely]] {
    throw std::runtime_error("Cannot reject Promise<void> with a null exception_ptr!");
  }

#ifdef NITRO_DEBUG
  assertPromiseState(*this, PromiseTask::WANTS_TO_REJECT);
#endif
  std::vector<OnRejectedFunc> listeners;
  {
    std::unique_lock lock(_mutex);
    _error = exception;
    listeners = takeRejectedListenersAndClearAllListeners(lock);
  }
  for (const auto& onRejected : listeners) {
    onRejected(exception);
  }
}

void Promise<void>::addOnResolvedListener(OnResolvedFunc&& onResolved) {
  {
    std::unique_lock lock(_mutex);
    if (!isResolved(lock)) {
      _onResolvedListeners.push_back(std::move(onResolved));
      return;
    }
  }
  onResolved();
}
void Promise<void>::addOnResolvedListener(const OnResolvedFunc& onResolved) {
  {
    std::unique_lock lock(_mutex);
    if (!isResolved(lock)) {
      _onResolvedListeners.push_back(onResolved);
      return;
    }
  }
  onResolved();
}
void Promise<void>::addOnRejectedListener(OnRejectedFunc&& onRejected) {
  std::exception_ptr error;
  {
    std::unique_lock lock(_mutex);
    if (!isRejected(lock)) {
      _onRejectedListeners.push_back(std::move(onRejected));
      return;
    }
    error = _error;
  }
  onRejected(error);
}
void Promise<void>::addOnRejectedListener(const OnRejectedFunc& onRejected) {
  std::exception_ptr error;
  {
    std::unique_lock lock(_mutex);
    if (!isRejected(lock)) {
      _onRejectedListeners.push_back(onRejected);
      return;
    }
    error = _error;
  }
  onRejected(error);
}

std::future<void> Promise<void>::await() {
  auto promise = std::make_shared<std::promise<void>>();
  addOnResolvedListener([promise]() { promise->set_value(); });
  addOnRejectedListener([promise](const std::exception_ptr& error) { promise->set_exception(error); });
  return promise->get_future();
}

const std::exception_ptr& Promise<void>::getError() const {
  std::unique_lock lock(_mutex);
  if (!isRejected(lock)) {
    throw std::runtime_error("Cannot get error when Promise<void> is not yet rejected!");
  }
  return _error;
}

std::vector<Promise<void>::OnResolvedFunc> Promise<void>::takeResolvedListenersAndClearAllListeners(const std::unique_lock<std::mutex>& lock) {
  auto listeners = std::move(_onResolvedListeners);
  clearAllListeners(lock);
  return listeners;
}

std::vector<Promise<void>::OnRejectedFunc> Promise<void>::takeRejectedListenersAndClearAllListeners(const std::unique_lock<std::mutex>& lock) {
  auto listeners = std::move(_onRejectedListeners);
  clearAllListeners(lock);
  return listeners;
}

void Promise<void>::clearAllListeners(const std::unique_lock<std::mutex>&) noexcept {
  _onResolvedListeners.clear();
  _onRejectedListeners.clear();
}

} // namespace margelo::nitro
