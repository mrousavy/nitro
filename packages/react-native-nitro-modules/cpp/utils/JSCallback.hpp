//
//  JSCallback.hpp
//  Nitro
//
//  Created by Marc Rousavy on 23.02.25.
//

#pragma once

namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "BorrowingReference.hpp"
#include "JSIConverter.hpp"
#include "NitroDefines.hpp"
#include "NitroTypeInfo.hpp"
#include "Promise.hpp"
#include <functional>
#include <jsi/jsi.h>

namespace margelo::nitro {

// -------- SyncJSCallback --------

template <typename Signature>
class SyncJSCallback;

template <typename R, typename... Args>
class SyncJSCallback<R(Args...)> final {
public:
  SyncJSCallback(jsi::Runtime& runtime, BorrowingReference<jsi::Function>&& function) : _runtime(runtime), _function(std::move(function)) {}

public:
  /**
   * Calls this `SyncJSCallback` synchronously, and
   * returns it's result (`R`).
   * The callee is responsible for ensuring that the
   * underlying `jsi::Function` can actually be called from this Thread.
   * In Debug, sanity checks are made to ensure the `jsi::Function` is still alive.
   */
  R call(Args... args) const {
#ifdef NITRO_DEBUG
    if (!_function) [[unlikely]] {
      throw std::runtime_error("Cannot call " + TypeInfo::getFriendlyTypename<SyncJSCallback<R(Args...)>>(true) +
                               " - the underlying `jsi::Function` has already been deleted!");
    }
#endif

    jsi::Value result = _function->call(_runtime, JSIConverter<std::decay_t<Args>>::toJSI(_runtime, args)...);
    if constexpr (std::is_void_v<R>) {
      // It's returning void. No result
      return;
    } else {
      // It's returning a type `R`, convert it
      return JSIConverter<R>::fromJSI(_runtime, result);
    }
  }

public:
  inline R operator()(Args... args) const {
    return call(args...);
  }

private:
  jsi::Runtime& _runtime;
  BorrowingReference<jsi::Function> _function;
};

// -------- AsyncJSCallback --------

template <typename Signature>
class AsyncJSCallback;

template <typename R, typename... Args>
class AsyncJSCallback<R(Args...)> final {
public:
  AsyncJSCallback(SyncJSCallback<R(Args...)>&& callback, const std::weak_ptr<Dispatcher>& dispatcher)
      : _callback(std::move(callback)), _dispatcher(dispatcher) {}

public:
  /**
   * Calls this `AsyncJSCallback` asynchronously, and returns a Promise that
   * can be awaited to receive the returned result (`R`) from JS.
   * This can be called from any Thread.
   * If the Runtime is no longer alive, this method throws.
   */
  std::shared_ptr<Promise<R>> call(Args... args) const {
    std::shared_ptr<Dispatcher> dispatcher = _dispatcher.lock();
    if (dispatcher == nullptr) [[unlikely]] {
      throw std::runtime_error("Failed to call " + TypeInfo::getFriendlyTypename<AsyncJSCallback<R(Args...)>>(true) +
                               " - the Dispatcher has already been destroyed!");
    }
    return dispatcher->runAsyncAwaitable<R>([callback = _callback, ... args = std::move(args)]() { return callback.call(args...); });
  }
  /**
   * Calls this `AsyncJSCallback` asynchronously, and ignore
   * any results or completions.
   * This can be called from any Thread.
   * If the Runtime is no longer alive, this method ignores the function call.
   */
  void callAndForget(Args... args) const {
    std::shared_ptr<Dispatcher> dispatcher = _dispatcher.lock();
    if (dispatcher == nullptr) [[unlikely]] {
      std::string name = TypeInfo::getFriendlyTypename<AsyncJSCallback<R(Args...)>>(true);
      Logger::log(LogLevel::Error, "AsyncJSCallback", "Failed to call %s - the Dispatcher has already been destroyed!", name.c_str());
      return;
    }
    dispatcher->runAsync([callback = _callback, ... args = std::move(args)]() { return callback.call(args...); });
  }

public:
  inline auto operator()(Args... args) const {
    if constexpr (std::is_void_v<R>) {
      return callAndForget(args...);
    } else {
      return call(args...);
    }
  }

private:
  SyncJSCallback<R(Args...)> _callback;
  std::weak_ptr<Dispatcher> _dispatcher;
};

} // namespace margelo::nitro
