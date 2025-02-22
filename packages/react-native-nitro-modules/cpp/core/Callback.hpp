//
// Created by Marc Rousavy on 22.02.25.
//

#pragma once

namespace margelo::nitro {
template <typename TResult>
class Promise;

class Dispatcher;
} // namespace margelo::nitro

#include "BorrowingReference.hpp"
#include "NitroDefines.hpp"
#include "NitroTypeInfo.hpp"
#include "ThreadPool.hpp"
#include "ThreadUtils.hpp"
#include <functional>
#include <jsi/jsi.h>
#include <memory>
#include <thread>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

template <typename Signature>
class NativeCallback;
template <typename Signature>
class JSCallback;

// ----- Callback base -----

template <typename Signature>
class Callback;

template <typename R, typename... Args>
class Callback<R(Args...)> final {
private:
  union Data {
    NativeCallback<R(Args...)> nativeCallback;
    JSCallback<R(Args...)> jsCallback;

    Data(const NativeCallback<R(Args...)>& native) : nativeCallback(native) {}
    Data(const JSCallback<R(Args...)>& js) : jsCallback(js) {}

    static Data copyFrom(const Callback<R(Args...)>& callback) {
      if (callback._isNative) {
        return Data(callback._data.nativeCallback);
      } else {
        return Data(callback._data.jsCallback);
      }
    }
    static Data moveFrom(Callback<R(Args...)>& callback) {
      if (callback._isNative) {
        return Data(std::move(callback._data.nativeCallback));
      } else {
        return Data(std::move(callback._data.jsCallback));
      }
    }
    ~Data() { /* caller is responsible for cleaning up NativeCallback/JSCallback */ }
  };

  friend Data;
  Data _data;
  bool _isNative;

public:
  /**
   * Create a new Callback that does nothing.
   */
  Callback() : _data(NativeCallback<R(Args...)>(nullptr)), _isNative(true) {}
  /**
   * Create a new Callback that points to a `jsi::Function` - this is thread-confined.
   */
  Callback(jsi::Runtime& runtime, const BorrowingReference<jsi::Function>& function, const std::shared_ptr<Dispatcher>& dispatcher)
      : _data(JSCallback<R(Args...)>(runtime, function, dispatcher)), _isNative(false) {}
  /**
   * Create a new Callback that points to a native `std::function<..>` - this can be called from any Thread.
   */
  template <typename F>
  Callback(F&& func) : _data(NativeCallback<R(Args...)>(std::forward<F>(func))), _isNative(true) {}

  Callback(const Callback& other) : _data(Data::copyFrom(other)), _isNative(other._isNative) {}
  Callback(Callback&& other) : _data(Data::moveFrom(other)), _isNative(other._isNative) {}

  ~Callback() {
    if (_isNative) {
      _data.nativeCallback.~NativeCallback<R(Args...)>();
    } else {
      _data.jsCallback.~JSCallback<R(Args...)>();
    }
  }

public:
  R callSync(Args... args) const {
    if (_isNative) {
      return _data.nativeCallback.callSync(std::forward<Args>(args)...);
    } else {
      return _data.jsCallback.callSync(std::forward<Args>(args)...);
    }
  }
  std::shared_ptr<Promise<R>> callAsync(Args... args) const {
    if (_isNative) {
      return _data.nativeCallback.callAsync(std::forward<Args>(args)...);
    } else {
      return _data.jsCallback.callAsync(std::forward<Args>(args)...);
    }
  }
  void callAsyncShootAndForget(Args... args) const {
    if (_isNative) {
      return _data.nativeCallback.callAsyncShootAndForget(std::forward<Args>(args)...);
    } else {
      return _data.jsCallback.callAsyncShootAndForget(std::forward<Args>(args)...);
    }
  }

public:
  auto operator()(Args... args) const {
    if constexpr (std::is_void_v<R>) {
      // Return void. Not need for Promise<T>
      return callAsyncShootAndForget(std::forward<Args>(args)...);
    } else {
      // Return an awaitable Promise<T>
      return callAsync(std::forward<Args>(args)...);
    }
  }
};

// ----- NativeCallback (std::function) -----

template <typename Signature>
class NativeCallback;

template <typename R, typename... Args>
class NativeCallback<R(Args...)> final {
public:
  template <typename Func>
  explicit NativeCallback(Func&& function) : _func(std::forward<Func>(function)) {}

public:
  inline R callSync(Args... args) const {
    return _func(std::forward<Args>(args)...);
  }
  inline std::shared_ptr<Promise<R>> callAync(Args... args) const {
    return Promise<R>::resolved(_func(std::forward<Args>(args)...));
  }
  inline void callAsyncShootAndForget(Args... args) const {
    _func(std::forward<Args>(args)...);
  }

private:
  std::function<R(Args...)> _func;
};

// ----- JSCallback (jsi::Function) -----

template <typename Signature>
class JSCallback;

template <typename R, typename... Args>
class JSCallback<R(Args...)> final {
public:
#ifdef NITRO_DEBUG
  explicit JSCallback(jsi::Runtime& runtime, const BorrowingReference<jsi::Function>& function,
                      const std::shared_ptr<Dispatcher>& dispatcher)
      : _runtime(runtime), _func(function), _dispatcher(dispatcher), _threadId(std::this_thread::get_id()),
        _threadName(ThreadUtils::getThreadName()) {}
#else
  explicit JSCallback(jsi::Runtime& runtime, const BorrowingReference<jsi::Function>& function,
                      const std::shared_ptr<Dispatcher>& dispatcher)
      : _runtime(runtime), _func(function), _dispatcher(dispatcher) {}
#endif

public:
  R callSync(Args... args) const;
  std::shared_ptr<Promise<R>> callAync(Args... args) const;
  void callAsyncShootAndForget(Args... args) const;

private:
  jsi::Runtime& _runtime;
  BorrowingReference<jsi::Function> _func;
  std::shared_ptr<Dispatcher> _dispatcher;
#ifdef NITRO_DEBUG
  std::thread::id _threadId;
  std::string _threadName;
#endif
};

} // namespace margelo::nitro

#include "Dispatcher.hpp"
#include "JSIConverter.hpp"

namespace margelo::nitro {

template <typename R, typename... Args>
R JSCallback<R(Args...)>::callSync(Args... args) const {
#ifdef NITRO_DEBUG
  // Check whether the callee is actually calling from the same Thread this JSCallback<..> was created on
  if (_threadId != std::this_thread::get_id()) [[unlikely]] {
    std::string typeName = TypeInfo::getFriendlyTypename<JSCallback<R(Args...)>>();
    throw std::runtime_error("Cannot call " + typeName + " on Thread " + ThreadUtils::getThreadName() + " - expected to run on Thread " +
                             _threadName + "! If you want to call this JSCallback on a different Thread, use `callAsync(...)` instead.");
  }
#endif
  // Check whether the function is still alive - if the Thread is still alive then the function is usually still alive too.
  if (!_func) [[unlikely]] {
    std::string typeName = TypeInfo::getFriendlyTypename<JSCallback<R(Args...)>>();
    throw std::runtime_error("Cannot call " + typeName + " - the jsi::Function has already been deleted!");
  }

  // Assuming we are on the correct thread, and the function is still alive, we can safely call it now. No need for locking.
  jsi::Value result = _func->call(_runtime, jsi::Value::undefined());
  if constexpr (std::is_void_v<R>) {
    // it's void
    return;
  } else {
    return JSIConverter<R>::fromJSI(_runtime, result);
  }
}

template <typename R, typename... Args>
std::shared_ptr<Promise<R>> JSCallback<R(Args...)>::callAync(Args... args) const {
  return _dispatcher->runAsyncAwaitable([this, ... args = std::move(args)]() { return this->callSync(args...); });
}

template <typename R, typename... Args>
void JSCallback<R(Args...)>::callAsyncShootAndForget(Args... args) const {
  _dispatcher->runAsync([this, ... args = std::move(args)]() { this->callSync(args...); });
}

} // namespace margelo::nitro
