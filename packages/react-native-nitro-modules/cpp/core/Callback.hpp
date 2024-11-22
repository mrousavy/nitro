//
// Created by Marc Rousavy on 20.11.24.
//

#pragma once

#include "Dispatcher.hpp"
#include "JSIConverter.hpp"
#include "NitroDefines.hpp"
#include "NitroLogger.hpp"
#include "OwningReference.hpp"
#include "Promise.hpp"
#include "ThreadUtils.hpp"
#include "TypeInfo.hpp"
#include <functional>
#include <jsi/jsi.h>
#include <memory>

namespace margelo::nitro {

using namespace facebook;

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
  virtual std::shared_ptr<Promise<TReturn>> callAsync(TArgs... args) const  {
    throw std::runtime_error("callAsync(..) is not implemented!");
  }
  /**
   * Calls this `Callback<...>` asynchronously, and await it's completion/result.
   * This can be called on any Thread, and will schedule a call to the proper JS Thread.
   */
  virtual void callAsyncAndForget(TArgs... args) const  {
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
  virtual AsyncReturnType operator()(TArgs... args) const  {
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
  std::shared_ptr<Dispatcher> _dispatcher;
  std::function<TReturn(TArgs...)> _function;
};

/**
 * Represents a JS Callback.
 * JS Callbacks are assumed to not be thread-safe, and must therefore always have a `Dispatcher`.
 * Users can optionally call JS Callbacks synchronously, but must do that on the JS Thread.
 */
template <typename Signature>
class JSCallback;
template <typename TReturn, typename... TArgs>
class JSCallback<TReturn(TArgs...)> : public Callback<TReturn(TArgs...)> {
public:
#ifdef NITRO_DEBUG
  /**
   * Create a new `JSCallback<...>` with the given Runtime, Function and Dispatcher.
   * The functionName can represent a debug-information for the function.
   */
  explicit JSCallback(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function, const std::shared_ptr<Dispatcher>& dispatcher,
                      const std::string& functionName) {
    _dispatcher = dispatcher;
    _callable = std::make_shared<Callable>(runtime, std::move(function), functionName);
  }
#else
  /**
   * Create a new `JSCallback<...>` with the given Runtime, Function and Dispatcher.
   */
  explicit JSCallback(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function, const std::shared_ptr<Dispatcher>& dispatcher) {
    _dispatcher = dispatcher;
    _callable = std::make_shared<Callable>(runtime, std::move(function));
  }
#endif

public:
  /**
   * Calls this `Callback<...>` synchronously.
   * This must be called on the same Thread that the underlying JS Function was created on,
   * so the JS Thread.
   * This is only guarded in debug.
   */
  TReturn callSync(TArgs... args) const override {
    return _callable->call(std::move(args)...);
  }

  /**
   * Calls this `Callback<...>` asynchronously, and await it's completion/result.
   * This can be called on any Thread, and will schedule a call to the proper JS Thread.
   */
  std::shared_ptr<Promise<TReturn>> callAsync(TArgs... args) const override {
    std::shared_ptr<Promise<TReturn>> promise = Promise<TReturn>::create();
    _dispatcher->runAsync([promise, callable = _callable, ... args = std::move(args)]() {
      try {
        // Call function synchronously now that we are on the right Thread
        if constexpr (std::is_void_v<TReturn>) {
          callable->call(std::move(args)...);
          promise->resolve();
        } else {
          TReturn result = callable->call(std::move(args)...);
          promise->resolve(std::move(result));
        }
      } catch (const std::exception& error) {
        // Something went wrong!
        promise->reject(error);
      }
    });
    return promise;
  }

  /**
   * Calls this `Callback<...>` asynchronously, but doesn't await it's completion.
   * This is like a shoot-and-forget version of `callAsync(...)`, and slightly more efficient if
   * you don't need to wait for the callback's completion.
   * This can be called on any Thread, and will schedule a call to the proper JS Thread.
   */
  void callAsyncAndForget(TArgs... args) const override {
    _dispatcher->runAsync([callable = _callable, ... args = std::move(args)]() { callable->call(std::move(args)...); });
  }

public:
  /**
   * Calls this `Callback<...>` asynchronously.
   * If it's return type is `void`, this is like a shoot-and-forget.
   * If it's return type is non-void, this returns an awaitable `Promise<T>` holding the result.
   */
  inline Callback<TReturn(TArgs...)>::AsyncReturnType operator()(TArgs... args) const override {
    if constexpr (std::is_void_v<TReturn>) {
      return callAsyncAndForget(std::move(args)...);
    } else {
      return callAsync(std::move(args)...);
    }
  }

public:
  /**
   * Gets this `Callback<...>`'s name.
   */
  std::string getName() const noexcept override {
#ifdef NITRO_DEBUG
    if constexpr (sizeof...(TArgs) > 0) {
      return _callable->getName() + "(...)";
    } else {
      return _callable->getName() + "()";
    }
#else
    if constexpr (sizeof...(TArgs) > 0) {
      return "anonymous(...)";
    } else {
      return "anonymous()";
    }
#endif
  }

  /**
   * Holds the actual callable JS function.
   */
  struct Callable {
  private:
    jsi::Runtime* _runtime;
    OwningReference<jsi::Function> _function;
#ifdef NITRO_DEBUG
    std::thread::id _originalThreadId;
    std::string _originalThreadName;
    std::string _functionName;
#endif
    
  public:
#ifdef NITRO_DEBUG
    explicit Callable(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function, const std::string& functionName): _runtime(runtime), _function(std::move(function)), _originalThreadId(std::this_thread::get_id()), _originalThreadName(ThreadUtils::getThreadName()), _functionName(functionName)  { }
#else
    explicit Callable(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function, const std::string& functionName): _runtime(runtime), _function(std::move(function)), _functionName(functionName)  { }
#endif

  public:
    std::string getName() const noexcept {
      return _functionName;
    }

  public:
    TReturn call(TArgs... args) const {
      Logger::log(LogLevel::Info, "Callback", "Being called...");
#ifdef NITRO_DEBUG
      if (_originalThreadId != std::this_thread::get_id()) [[unlikely]] {
        // Tried to call a sync function on a different Thread!
        throw std::runtime_error(
            "Failed to call function `" + getName() + "` on Thread " + ThreadUtils::getThreadName() +
            " - it is not the same Thread it was created on! If you want to call this function asynchronously, use callAsync() instead.");
      }
#endif
      Logger::log(LogLevel::Info, "Callback", "thread is ok...");

      OwningLock<jsi::Function> lock = _function.lock();
      Logger::log(LogLevel::Info, "Callback", "function is locked...");
      if (_function == nullptr) [[unlikely]] {
        Logger::log(LogLevel::Info, "Callback", "func is dead!...");
        if constexpr (std::is_void_v<TReturn>) {
          // runtime has already been deleted. since this returns void, we can just ignore it being deleted.
          Logger::log(LogLevel::Error, "Callback",
                      "Failed to call function `%s` - the JS Runtime has already been destroyed!", getName().c_str());
          return;
        } else {
          // runtime has already been deleted, but we are expecting a return value - throw an error in this case.
          throw std::runtime_error("Failed to call function `" + getName() + "` - the JS Runtime has already been destroyed!");
        }
      }

      if constexpr (std::is_void_v<TReturn>) {
        Logger::log(LogLevel::Info, "Callback", "calling void...");
        // Just call void function :)
        _function->call(*_runtime, JSIConverter<std::decay_t<TArgs>>::toJSI(*_runtime, args)...);
      } else {
        Logger::log(LogLevel::Info, "Callback", "calling T...");
        // Call function, and convert result
        jsi::Value result = _function->call(*_runtime, JSIConverter<std::decay_t<TArgs>>::toJSI(*_runtime, args)...);
        return JSIConverter<TReturn>::fromJSI(*_runtime, result);
      }
    }
  };

private:
  std::shared_ptr<Dispatcher> _dispatcher;
  std::shared_ptr<Callable> _callable;
};

} // namespace margelo::nitro
