//
// Created by Marc Rousavy on 20.11.24.
//

#pragma once

namespace margelo::nitro {
template<typename TResult, typename TError>
class Promise;
} // namespace margelo::nitro

#include "Promise.hpp"
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
template <typename TReturn, typename... TArgs>
class Callback<TReturn(TArgs...)> {
public:
  virtual ~Callback() = default;

public:
  /**
   * Calls this `Callback<...>` synchronously.
   * This must be called on the same Thread that the underlying JS Function was created on,
   * so the JS Thread.
   * This is only guarded in debug.
   */
  virtual TReturn callSync(TArgs... args) const {
    throw std::runtime_error("callSync(..) is not implemented!");
  }
  /**
   * Calls this `Callback<...>` asynchronously, and await it's completion/result.
   * This can be called on any Thread, and will schedule a call to the proper JS Thread.
   */
  virtual std::shared_ptr<Promise<TReturn>> callAsync(TArgs... args) const {
    throw std::runtime_error("callAsync(..) is not implemented!");
  }
  /**
   * Calls this `Callback<...>` asynchronously, and await it's completion/result.
   * This can be called on any Thread, and will schedule a call to the proper JS Thread.
   */
  virtual void callAsyncAndForget(TArgs... args) const {
    throw std::runtime_error("callAsyncAndForget(..) is not implemented!");
  }

public:
  using AsyncReturnType = std::conditional_t<std::is_void_v<TReturn>,
                                             /* async with no result */ void,
                                             /* async with a result */ std::shared_ptr<Promise<TReturn>>>;
  /**
   * Calls this `Callback<...>` asynchronously.
   * If it's return type is `void`, this is like a shoot-and-forget.
   * If it's return type is non-void, this returns an awaitable `Promise<T>` holding the result.
   */
  virtual AsyncReturnType operator()(TArgs... args) const {
    throw std::runtime_error("operator() is not implemented!");
  };

public:
  /**
   * Gets this `Callback<...>`'s name.
   */
  virtual std::string getName() const noexcept  {
    throw std::runtime_error("getName() is not implemented!");
  }
};

/**
 * Represents a native Callback.
 * Native Callbacks are assumed to be thread-safe, and therefore are assumed to always be synchronously callable.
 */
template <typename Signature>
class NativeCallback;
template <typename TReturn, typename... TArgs>
class NativeCallback<TReturn(TArgs...)> : public Callback<TReturn(TArgs...)> {
public:
  explicit NativeCallback(std::function<TReturn(TArgs...)>&& func) : _function(std::move(func)) {}
  explicit NativeCallback(const std::function<TReturn(TArgs...)>& func) : _function(func) {}

public:
  TReturn callSync(TArgs... args) const override {
    return _function(std::move(args)...);
  }
  std::shared_ptr<Promise<TReturn>> callAsync(TArgs... args) const override {
    if constexpr (std::is_void_v<TReturn>) {
      callSync(std::move(args)...);
      return Promise<void>::resolved();
    } else {
      TReturn result = callSync(std::move(args)...);
      return Promise<TReturn>::resolved(std::move(result));
    }
  }
  void callAsyncAndForget(TArgs... args) const override {
    _function(std::move(args)...);
  }
  
public:
  const std::function<TReturn(TArgs...)>& getFunction() const override {
    return _function;
  }

public:
  inline Callback<TReturn(TArgs...)>::AsyncReturnType operator()(TArgs... args) const override {
    if constexpr (std::is_void_v<TReturn>) {
      callSync(std::move(args)...);
    } else {
      return callSync(std::move(args)...);
    }
  }

public:
  std::string getName() const noexcept override {
    return "nativeFunction";
  }

private:
  std::function<TReturn(TArgs...)> _function;
};

} // namespace margelo::nitro
