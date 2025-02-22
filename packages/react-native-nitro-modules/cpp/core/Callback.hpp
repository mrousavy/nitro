//
// Created by Marc Rousavy on 22.02.25.
//

#pragma once

#include "BorrowingReference.hpp"
#include "Dispatcher.hpp"
#include "JSIConverter.hpp"
#include "NitroDefines.hpp"
#include "NitroTypeInfo.hpp"
#include "Promise.hpp"
#include "ThreadPool.hpp"
#include "ThreadUtils.hpp"
#include <functional>
#include <jsi/jsi.h>
#include <memory>
#include <thread>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

// ----- Callback base -----

template <typename Signature>
class Callback;

template <typename R, typename... Args>
class Callback<R(Args...)> {
private:
  using DefaultReturn = std::conditional_t<std::is_void_v<R>, void, Promise<R>>;

public:
  virtual R callSync(Args... args) const = 0;
  virtual Promise<R> callAsync(Args... args) const = 0;
  virtual void callAsyncShootAndForget(Args... args) const = 0;

public:
  auto operator()(Args... args) const final {
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
class NativeCallback<R(Args...)> final : public Callback<R(Args...)> {
public:
  template <typename Func>
  explicit NativeCallback(Func&& function) : _func(std::forward<Func>(function)) {}

public:
  inline R callSync(Args... args) const override {
    return _func(std::forward<Args>(args)...);
  }
  inline Promise<R> callAync(Args... args) const override {
    return Promise<R>::resolved(_func(std::forward<Args>(args)...));
  }
  inline void callAsyncShootAndForget(Args... args) const override {
    _func(std::forward<Args>(args)...);
  }

private:
  std::function<R(Args...)> _func;
};

// ----- JSCallback (jsi::Function) -----

template <typename Signature>
class JSCallback;

template <typename R, typename... Args>
class JSCallback<R(Args...)> final : public Callback<R(Args...)> {
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
  inline R callSync(Args&&... args) const override {
#ifdef NITRO_DEBUG
    if (_threadId != std::this_thread::get_id()) [[unlikely]] {
      std::string typeName = TypeInfo::getFriendlyTypename<JSCallback<R(Args...)>>();
      throw std::runtime_error("Cannot call " + typeName + " on Thread " + ThreadUtils::getThreadName() + " - expected to run on Thread " +
                               _threadName + "! If you want to call this JSCallback on a different Thread, use `callAsync(...)` instead.");
    }
#endif
    if (!_func) [[unlikely]] {
      std::string typeName = TypeInfo::getFriendlyTypename<JSCallback<R(Args...)>>();
      throw std::runtime_error("Cannot call " + typeName + " - the jsi::Function has already been deleted!");
    }

    jsi::Value result = _func->call(_runtime, JSIConverter<Args>::toJSI(std::forward<Args>(args))...);
    return JSIConverter<R>::fromJSI(_runtime, result);
  }
  inline Promise<R> callAync(Args... args) const override {
    return _dispatcher->runAsyncAwaitable([this, args = std::move(args)...]() { return this->callSync(args...); });
  }
  inline void callAsyncShootAndForget(Args... args) const override {
    _dispatcher->runAsync([this, args = std::move(args)...]() { this->callSync(args...); });
  }

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
