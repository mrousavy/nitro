//
// Created by Marc Rousavy on 20.11.24.
//

#pragma once

#include "Callable.hpp"
#include "Promise.hpp"
#include <memory>

namespace margelo::nitro {

/**
 * Represents a callable JS function.
 * This can be either called synchronously (must be on the same Thread), or asynchronously (default).
 * If calling asynchronously, the result can either be awaited (`Promise<T>`), or ignored (`void`).
 */
template <typename Signature>
class CallableJSFunction;
template <typename R, typename... Args>
class CallableJSFunction<R(Args...)>: public Callable<R(Args...)>, public std::enable_shared_from_this<CallableJSFunction<R(Args...)>> {
private:
#ifdef NITRO_DEBUG
  explicit CallableJSFunction(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function, const std::shared_ptr<Dispatcher>& dispatcher,
                              const std::string& functionName) {
    _runtime = runtime;
    _function = std::move(function);
    _dispatcher = dispatcher;
    _functionName = sizeof...(Args) > 0 ? functionName + "(...)" : functionName + "()";
    _originalThreadId = std::this_thread::get_id();
    _originalThreadName = ThreadUtils::getThreadName();
  }
#else
  explicit CallableJSFunction(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function, const std::shared_ptr<Dispatcher>& dispatcher) {
    _runtime = runtime;
    _function = std::move(function);
    _dispatcher = dispatcher;
  }
#endif

#ifdef NITRO_DEBUG
public:
  std::shared_ptr<CallableJSFunction<R(Args...)>> create(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function, const std::shared_ptr<Dispatcher>& dispatcher,
                                                        const std::string& functionName) {
    return std::shared_ptr<CallableJSFunction<R(Args...)>>(new CallableJSFunction(runtime, std::move(function), dispatcher, functionName));
  }
#else
  std::shared_ptr<CallableJSFunction<R(Args...)>> create(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function, const std::shared_ptr<Dispatcher>& dispatcher) {
    return std::shared_ptr<CallableJSFunction<R(Args...)>>(new CallableJSFunction(runtime, std::move(function), dispatcher));
  }
#endif

public:
  R callSync(Args... args) const override {
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
      if constexpr (std::is_void_v<R>) {
        // runtime has already been deleted. since this returns void, we can just ignore it being deleted.
        Logger::log(LogLevel::Error, "Callback", "Failed to call function `%s` - the JS Runtime has already been destroyed!",
                    getName().c_str());
        return;
      } else {
        // runtime has already been deleted, but we are expecting a return value - throw an error in this case.
        throw std::runtime_error("Failed to call function `" + getName() + "` - the JS Runtime has already been destroyed!");
      }
    }

    if constexpr (std::is_void_v<R>) {
      // Just call void function :)
      _function->call(*_runtime, JSIConverter<std::decay_t<Args>>::toJSI(*_runtime, args)...);
    } else {
      // Call function, and convert result
      jsi::Value result = _function->call(*_runtime, JSIConverter<std::decay_t<Args>>::toJSI(*_runtime, args)...);
      return JSIConverter<R>::fromJSI(*_runtime, result);
    }
  }

  std::shared_ptr<Promise<R>> callAsync(Args... args) const override {
    std::shared_ptr<Promise<R>> promise = Promise<R>::create();
    auto self = this->shared_from_this();
    _dispatcher->runAsync([promise, self, ... args = std::move(args)]() {
      try {
        // Call function synchronously now that we are on the right Thread
        if constexpr (std::is_void_v<R>) {
          self->callSync(std::move(args)...);
          promise->resolve();
        } else {
          R result = self->callSync(std::move(args)...);
          promise->resolve(std::move(result));
        }
      } catch (const std::exception& error) {
        // Something went wrong!
        promise->reject(error);
      }
    });
    return promise;
  }

  void callAsyncAndForget(Args... args) const override {
    auto self = this->shared_from_this();
    _dispatcher->runAsync([self, ... args = std::move(args)]() {
      // Call actual JS function
      self->callSync(std::move(args)...);
    });
  }

public:
  [[nodiscard]] std::string getName() const noexcept override {
#ifdef NITRO_DEBUG
    return _functionName;
#else
    return "anonymous()";
#endif
  }

private:
  jsi::Runtime* _runtime;
  OwningReference<jsi::Function> _function;
  std::shared_ptr<Dispatcher> _dispatcher;
#ifdef NITRO_DEBUG
  std::string _functionName;
  std::thread::id _originalThreadId;
  std::string _originalThreadName;
#endif
};

} // namespace margelo::nitro
