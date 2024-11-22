//
// Created by Marc Rousavy on 20.11.24.
//

#pragma once

#include "Callable.hpp"
#include <functional>
#include <memory>

namespace margelo::nitro {

/**
 * Represents a callable native `std::function`.
 * This can be called synchronously or asynchronously - it doesn't matter.
 */
template <typename Signature>
class CallableNativeFunction;
template <typename R, typename... Args>
class CallableNativeFunction<R(Args...)> : public Callable<R(Args...)> {
private:
  explicit CallableNativeFunction(std::function<R(Args...)>&& function) : _function(std::move(function)) {}
  explicit CallableNativeFunction(const std::function<R(Args...)>& function) : _function(function) {}

public:
  std::shared_ptr<CallableNativeFunction<R(Args...)>> create(std::function<R(Args...)>&& function) {
    return std::shared_ptr<CallableNativeFunction<R(Args...)>>(new CallableNativeFunction(std::move(function)));
  }
  std::shared_ptr<CallableNativeFunction<R(Args...)>> create(const std::function<R(Args...)>& function) {
    return std::shared_ptr<CallableNativeFunction<R(Args...)>>(new CallableNativeFunction(function));
  }

public:
  R callSync(Args... args) const override {
    return _function(std::forward<Args>(args)...);
  }

  void callAsync(Args... args) const override {
    callSync(std::forward<Args>(args)...);
  }

  std::shared_ptr<Promise<R>> callAsyncAwait(Args... args) const override {
    if constexpr (std::is_void_v<R>) {
      self->callSync(std::move(args)...);
      return Promise::resolved();
    } else {
      R result = self->callSync(std::move(args)...);
      return Promise::resolved(std::move(result));
    }
  }

public:
  const std::function<R(Args...)>& getFunction() const {
    return _function;
  }

public:
  [[nodiscard]] std::string getName() const noexcept override {
    return "nativeFunction";
  }

private:
  std::function<R(Args...)> _function;
};

} // namespace margelo::nitro