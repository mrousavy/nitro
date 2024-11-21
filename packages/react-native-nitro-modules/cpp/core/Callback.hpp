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
template <typename TReturn, typename... TArgs>
class Callback : public std::enable_shared_from_this<Callback<TReturn, TArgs...>> {
private:
#ifdef NITRO_DEBUG
  explicit Callback(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function, const std::shared_ptr<Dispatcher>& dispatcher,
                    const std::string& functionName)
      : _runtime(runtime), _function(std::move(function)), _dispatcher(dispatcher) {
    _originalThreadId = std::this_thread::get_id();
    _originalThreadName = ThreadUtils::getThreadName();
    _functionName = functionName;
  }
#else
  explicit Callback(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function, const std::shared_ptr<Dispatcher>& dispatcher)
      : _runtime(runtime), _function(std::move(function)), _dispatcher(dispatcher) {}
#endif

public:
#ifdef NITRO_DEBUG
  /**
   * Create a new `Callback<...>` with the given Runtime, Function and Dispatcher.
   * The functionName can represent a debug-information for the function.
   */
  static std::shared_ptr<Callback<TReturn, TArgs...>> create(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function,
                                                             const std::shared_ptr<Dispatcher>& dispatcher,
                                                             const std::string& functionName) {
    return std::shared_ptr<Callback<TReturn, TArgs...>>(
        new Callback<TReturn, TArgs...>(runtime, std::move(function), dispatcher, functionName));
  }
#else
  /**
   * Create a new `Callback<...>` with the given Runtime, Function and Dispatcher.
   */
  static std::shared_ptr<Callback<TReturn, TArgs...>> create(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function,
                                                             const std::shared_ptr<Dispatcher>& dispatcher) {
    return std::shared_ptr<Callback<TReturn, TArgs...>>(new Callback<TReturn, TArgs...>(runtime, std::move(function), dispatcher));
  }
#endif

public:
  /**
   * Calls this `Callback<...>` synchronously.
   * This must be called on the same Thread that the underlying JS Function was created on,
   * so the JS Thread.
   * This is only guarded in debug.
   */
  TReturn callSync(TArgs... args) {
#ifdef NITRO_DEBUG
    if (_originalThreadId != std::this_thread::get_id()) [[unlikely]] {
      // Tried to call a sync function on a different Thread!
      throw std::runtime_error(
          "Failed to call function `" + getName() + "` on Thread " + ThreadUtils::getThreadName() +
          " - it is not the same Thread it was created on! If you want to call this function asynchronously, use callAsync() instead.");
    }
#endif

    OwningLock<jsi::Function> lock = _function.lock();
    if (_function == nullptr) [[unlikely]] {
      if constexpr (std::is_void_v<TReturn>) {
        // runtime has already been deleted. since this returns void, we can just ignore it being deleted.
        Logger::log(LogLevel::Error, "Callback",
                    "Failed to call function `" + getName() + "` - the JS Runtime has already been destroyed!");
        return;
      } else {
        // runtime has already been deleted, but we are expecting a return value - throw an error in this case.
        throw std::runtime_error("Failed to call function `" + getName() + "` - the JS Runtime has already been destroyed!");
      }
    }

    if constexpr (std::is_void_v<TReturn>) {
      // Just call void function :)
      _function->call(*_runtime, JSIConverter<std::decay_t<TArgs>>::toJSI(*_runtime, args)...);
    } else {
      // Call function, and convert result
      jsi::Value result = _function->call(*_runtime, JSIConverter<std::decay_t<TArgs>>::toJSI(*_runtime, args)...);
      return JSIConverter<TReturn>::fromJSI(*_runtime, result);
    }
  }

  /**
   * Calls this `Callback<...>` asynchronously, and await it's completion/result.
   * This can be called on any Thread, and will schedule a call to the proper JS Thread.
   */
  std::shared_ptr<Promise<TReturn>> callAsync(TArgs... args) {
    std::shared_ptr<Promise<TReturn>> promise = Promise<TReturn>::create();
    std::shared_ptr<Callback<TReturn, TArgs...>> self = this->shared_from_this();
    _dispatcher->runAsync([promise, self, ... args = std::move(args)]() {
      try {
        // Call function synchronously now that we are on the right Thread
        TReturn result = self->callSync(std::move(args)...);
        promise->resolve(std::move(result));
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
  std::shared_ptr<void> callAsyncAndForget(TArgs... args) {
    std::shared_ptr<Callback<TReturn, TArgs...>> self = this->shared_from_this();
    _dispatcher->runAsync([self, ... args = std::move(args)]() { self->callSync(std::move(args)...); });
  }

public:
  /**
   * Calls this `Callback<...>` asynchronously.
   * If it's return type is `void`, this is like a shoot-and-forget.
   * If it's return type is non-void, this returns an awaitable `Promise<T>` holding the result.
   */
  inline auto operator()(TArgs... args) {
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
  std::string getName() const noexcept {
#ifdef NITRO_DEBUG
    if constexpr (sizeof...(TArgs) > 0) {
      return _functionName + "(...)";
    } else {
      return _functionName + "()";
    }
#else
    if constexpr (sizeof...(TArgs) > 0) {
      return "anonymous(...)";
    } else {
      return "anonymous()";
    }
#endif
  }

private:
  jsi::Runtime* _runtime;
  OwningReference<jsi::Function> _function;
  std::shared_ptr<Dispatcher> _dispatcher;
#ifdef NITRO_DEBUG
  std::thread::id _originalThreadId;
  std::string _originalThreadName;
  std::string _functionName;
#endif
};

} // namespace margelo::nitro
