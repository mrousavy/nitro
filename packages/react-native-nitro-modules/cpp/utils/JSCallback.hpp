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
  R call(Args... args) const;

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
  AsyncJSCallback(SyncJSCallback<R(Args...)>&& callback, std::shared_ptr<Dispatcher>& dispatcher)
      : _callback(std::move(callback)), _dispatcher(dispatcher) {}

public:
  std::shared_ptr<Promise<R>> call(Args... args) const {
    return _dispatcher->runAsyncAwaitable<R>([this, ... args = std::move(args)]() { return this->_callback.call(args...); });
  }
  void callAndForget(Args... args) const {
    _dispatcher->runAsync([this, ... args = std::move(args)]() { return this->_callback.call(args...); });
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
  std::shared_ptr<Dispatcher> _dispatcher;
};

} // namespace margelo::nitro

#include "JSIConverter.hpp"

namespace margelo::nitro {

template <typename R, typename... Args>
R SyncJSCallback<R(Args...)>::call(Args... args) const {
  jsi::Value result = _function->call(_runtime, JSIConverter<std::decay_t<Args>>::toJSI(_runtime, args)...);
  if constexpr (std::is_void_v<R>) {
    // It's returning void. No result
    return;
  } else {
    // It's returning a type `R`, convert it
    return JSIConverter<R>::fromJSI(_runtime, result);
  }
}

}
