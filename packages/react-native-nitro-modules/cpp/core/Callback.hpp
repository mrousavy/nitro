//
// Created by Marc Rousavy on 20.11.24.
//

#pragma once

namespace margelo::nitro {
template <typename Signature>
class Callback;
template <typename Signature>
class Callable;
template <typename T>
class Promise;
} // namespace margelo::nitro

#include <functional>
#include <memory>

namespace margelo::nitro {

/**
 * Represents a callable JS function.
 * This can be either called synchronously (must be on the same Thread), or asynchronously (default).
 * If calling asynchronously, the result can either be awaited (`Promise<T>`), or ignored (`void`).
 */
template <typename Signature>
class Callback;
template <typename R, typename... Args>
class Callback<R(Args...)> final {
public:
  explicit Callback(const std::shared_ptr<Callable<R(Args...)>>& callable) : _callable(callable) {}
  explicit Callback(std::shared_ptr<Callable<R(Args...)>>&& callable) : _callable(std::move(callable)) {}

public:
  /**
   * Calls this `Callback<...>` synchronously.
   * If this `Callback<...>` is holding a JS Function, `callSync(...)` must be
   * called on the same Thread that the underlying JS Function was created on.
   * This is only guarded in debug.
   */
  R callSync(Args... args) const {
    return _callable->callSync(std::forward<Args>(args)...);
  }
  /**
   * Calls this `Callback<...>` asynchronously, and ignores it's completion/result.
   * This can be called on any Thread.
   */
  void callAsync(Args... args) const {
    return _callable->callAsync(std::forward<Args>(args)...);
  }
  /**
   * Calls this `Callback<...>` asynchronously, and await it's completion/result.
   * This can be called on any Thread.
   */
  std::shared_ptr<Promise<R>> callAsyncAwait(Args... args) const {
    return _callable->callAsyncAwait(std::forward<Args>(args)...);
  }

public:
  using AsyncReturnType = std::conditional_t<std::is_void_v<R>,
                                             /* async with no result */ void,
                                             /* async with a result */ std::shared_ptr<Promise<R>>>;
  /**
   * Calls this `Callback<...>` asynchronously.
   * If it's return type is `void`, this is like a shoot-and-forget.
   * If it's return type is non-void, this returns an awaitable `Promise<T>` holding the result.
   */
  AsyncReturnType operator()(Args... args) const {
    if constexpr (std::is_void_v<R>) {
      callAsync(std::forward<Args>(args)...);
    } else {
      return callAsyncAwait(std::forward<Args>(args)...);
    }
  };

public:
  /**
   * Returns whether this `Callback<T>` is thread-safe, or not.
   * * If it is thread-safe, you can safely call `callSync(..)` from any thread.
   * * If it is NOT thread-safe, you must call `callSync(..)` on the thread this
   *   callback was created on, or use `callAsync(..)`/`callAsyncAwaitable(..)` instead.
   */
  [[nodiscard]] bool isThreadSafe() const {
    return _callable->isThreadSafe();
  }
  /**
   * Gets this `Callback<...>`'s name.
   */
  [[nodiscard]] virtual std::string getName() const {
    return _callable->getName();
  }
  
public:
  /**
   * Converts this `Callback<R(Args...)>` to a `std::function<R(Args...)>`
   */
  std::function<R(Args...)> toFunction() const {
    return *this;
  }

private:
  std::shared_ptr<Callable<R(Args...)>> _callable;
};

} // namespace margelo::nitro

#include "Callable.hpp"
