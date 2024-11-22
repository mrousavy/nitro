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
#include "Promise.hpp"

namespace margelo::nitro {

/**
 * Represents a callable function.
 * This can be either called synchronously (must be on the same Thread), or asynchronously (default).
 * If calling asynchronously, the result can either be awaited (`Promise<T>`), or ignored (`void`).
 */
template <typename Signature>
class Callable;
template <typename R, typename... Args>
class Callable<R(Args...)> {
public:
  virtual ~Callable() = default;
  Callable(const Callable&) = delete;
  Callable(Callable&&) = delete;

public:
  /**
   * Calls this callable, synchronously.
   * If this `Callable<>` represents a non-thread-safe function (e.g. a JS Function),
   * the caller must ensure that it is being called on the proper thread.
   */
  virtual R callSync(Args... args) const = 0;
  /**
   * Calls this callable, asynchronously.
   * This method can be called from any Thread.
   */
  virtual void callAsync(Args... args) const {
    if (isThreadSafe()) {
      callSync(std::forward<Args>(args)...);
    } else {
      throw std::runtime_error(getDebugName() + " is not thread-safe and doesn't have an implementation for callAsync(...)!");
    }
  }
  /**
   * Calls this callable, asynchronously, and returns an awaitable `Promise<T>`.
   */
  virtual std::shared_ptr<Promise<R>> callAsyncAwait(Args... args) const {
    if (isThreadSafe()) {
      callSync(std::forward<Args>(args)...);
    } else {
      throw std::runtime_error(getDebugName() + " is not thread-safe and doesn't have an implementation for callAsyncAwait(...)!");
    }
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
  inline AsyncReturnType call(Args... args) const {
    if constexpr (std::is_void_v<R>) {
      callAsync(std::forward<Args>(args)...);
    } else {
      return callAsyncAwait(std::forward<Args>(args)...);
    }
  };
  /**
   * Calls this `Callback<...>` asynchronously.
   * If it's return type is `void`, this is like a shoot-and-forget.
   * If it's return type is non-void, this returns an awaitable `Promise<T>` holding the result.
   */
  inline AsyncReturnType operator()(Args... args) const {
    return call(std::forward<Args>(args)...);
  };

public:
  /**
   * Returns whether this `Callback<T>` is thread-safe, or not.
   * * If it is thread-safe, you can safely call `callSync(..)` from any thread.
   * * If it is NOT thread-safe, you must call `callSync(..)` on the thread this
   *   callback was created on, or use `callAsync(..)`/`callAsyncAwaitable(..)` instead.
   */
  [[nodiscard]] virtual bool isThreadSafe() const = 0;
  /**
   * Gets this `Callback<...>`'s name.
   */
  [[nodiscard]] virtual std::string getName() const {
    return "anonymous";
  }
  
private:
  static std::string getDebugName() {
    return std::string("Callback<") + TypeInfo::getFriendlyTypename<R>() + "(" + TypeInfo::getFriendlyTypenames<Args...>() + ")>";
  }
};

} // namespace margelo::nitro
