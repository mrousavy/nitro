//
// Created by Marc Rousavy on 20.11.24.
//

#pragma once

namespace margelo::nitro {
template <typename T>
class Promise;
} // namespace margelo::nitro

#include "Callback.hpp"
#include "Dispatcher.hpp"
#include "JSIConverter.hpp"
#include "NitroDefines.hpp"
#include "OwningReference.hpp"
#include "Promise.hpp"
#include "ThreadUtils.hpp"
#include "TypeInfo.hpp"
#include <functional>
#include <jsi/jsi.h>
#include <memory>
#include <utility>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents a JS Callback.
 * JS Callbacks are assumed to not be thread-safe, and must therefore always have a `Dispatcher`.
 * Users can optionally call JS Callbacks synchronously, but must do that on the JS Thread.
 */
template <typename Signature>
class JSCallback;
template <typename TReturn, typename... TArgs>
class JSCallback<TReturn(TArgs...)> final : public Callback<TReturn(TArgs...)>, public std::enable_shared_from_this<JSCallback<TReturn(TArgs...)>> {
private:
#ifdef NITRO_DEBUG
  explicit JSCallback(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function, const std::shared_ptr<Dispatcher>& dispatcher,
                      const std::string& functionName) {
    _runtime = runtime;
    _function = std::move(function);
    _dispatcher = dispatcher;
    _functionName = sizeof...(TArgs) > 0 ? functionName + "(...)" : functionName + "()";
    _originalThreadId = std::this_thread::get_id();
    _originalThreadName = ThreadUtils::getThreadName();
  }
#else
  explicit JSCallback(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function, const std::shared_ptr<Dispatcher>& dispatcher) {
    _runtime = runtime;
    _function = std::move(function);
    _dispatcher = dispatcher;
  }
#endif
  
#ifdef NITRO_DEBUG
public:
  std::shared_ptr<JSCallback<TReturn(TArgs...)>> create(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function, const std::shared_ptr<Dispatcher>& dispatcher,
                                                        const std::string& functionName) {
    return std::shared_ptr<JSCallback<TReturn(TArgs...)>>(new JSCallback(runtime, std::move(function), dispatcher, functionName));
  }
#else
  std::shared_ptr<JSCallback<TReturn(TArgs...)>> create(jsi::Runtime* runtime, OwningReference<jsi::Function>&& function, const std::shared_ptr<Dispatcher>& dispatcher) {
    return std::shared_ptr<JSCallback<TReturn(TArgs...)>>(new JSCallback(runtime, std::move(function), dispatcher));
  }
#endif

public:
  TReturn callSync(TArgs... args) const override {
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
        Logger::log(LogLevel::Error, "Callback", "Failed to call function `%s` - the JS Runtime has already been destroyed!",
                    getName().c_str());
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

  std::shared_ptr<Promise<TReturn>> callAsync(TArgs... args) const override {
    std::shared_ptr<Promise<TReturn>> promise = Promise<TReturn>::create();
    auto self = this->shared_from_this();
    _dispatcher->runAsync([promise, self, ... args = std::move(args)]() {
      try {
        // Call function synchronously now that we are on the right Thread
        if constexpr (std::is_void_v<TReturn>) {
          self->callSync(std::move(args)...);
          promise->resolve();
        } else {
          TReturn result = self->callSync(std::move(args)...);
          promise->resolve(std::move(result));
        }
      } catch (const std::exception& error) {
        // Something went wrong!
        promise->reject(error);
      }
    });
    return promise;
  }

  void callAsyncAndForget(TArgs... args) const override {
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
