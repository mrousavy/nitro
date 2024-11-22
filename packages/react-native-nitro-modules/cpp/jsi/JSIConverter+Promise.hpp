//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;

template <typename T>
class Promise;

template <typename Signature>
class Callback;
} // namespace margelo::nitro

#include "JSIConverter.hpp"

#include "Callback.hpp"
#include "Promise.hpp"
#include "NitroLogger.hpp"
#include <exception>
#include <jsi/jsi.h>
#include <memory>

namespace margelo::nitro {

using namespace facebook;

// Promise<T> <> Promise<T>
template <typename TResult>
struct JSIConverter<std::shared_ptr<Promise<TResult>>> final {
  static inline std::shared_ptr<Promise<TResult>> fromJSI(jsi::Runtime& runtime, const jsi::Value& value) {
    // Create new Promise and prepare onResolved / onRejected callbacks
    auto promise = Promise<TResult>::create();
    auto thenCallback = [&]() {
      if constexpr (std::is_void_v<TResult>) {
        // void: resolve()
        return JSIConverter<std::function<void(std::monostate)>>::toJSI(runtime, [=](std::monostate) { promise->resolve(); });
      } else {
        // T: resolve(T)
        return JSIConverter<std::function<void(TResult)>>::toJSI(runtime, [=](const TResult& result) { promise->resolve(result); });
      }
    }();
    auto catchCallback = JSIConverter<std::function<void(const std::exception_ptr&)>>::toJSI(
        runtime, [=](const std::exception_ptr& exception) { promise->reject(exception); });

    // Chain .then listeners on JS Promise (onResolved and onRejected)
    jsi::Object jsPromise = value.asObject(runtime);
    jsi::Function thenFn = jsPromise.getPropertyAsFunction(runtime, "then");
    thenFn.callWithThis(runtime, jsPromise, thenCallback, catchCallback);

    return promise;
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::shared_ptr<Promise<TResult>>& promise) {
    if (promise->isPending()) {
      // Get Promise ctor from global
      jsi::Function promiseCtor = runtime.global().getPropertyAsFunction(runtime, "Promise");
      jsi::HostFunctionType executor = [promise](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
                                                 size_t count) -> jsi::Value {
        // Add resolver listener
        if constexpr (std::is_void_v<TResult>) {
          // It's resolving to void.
          auto resolver = JSIConverter<Callback<void()>>::fromJSI(runtime, arguments[0]);
          promise->addOnResolvedListener(std::move(resolver));
        } else {
          // It's a type.
          auto resolver = JSIConverter<Callback<void(TResult)>>::fromJSI(runtime, arguments[0]);
          promise->addOnResolvedListener(std::move(resolver));
        }
        // Add rejecter listener
        auto rejecter = JSIConverter<Callback<void(const std::exception_ptr&)>>::fromJSI(runtime, arguments[1]);
        promise->addOnRejectedListener([rejecter = std::move(rejecter)](const std::exception_ptr& exception) {
          rejecter.callAsyncAndForget(exception);
        });

        return jsi::Value::undefined();
      };
      // Call `Promise` constructor (aka create promise), and pass `executor` function
      return promiseCtor.callAsConstructor(
          runtime, jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, "executor"), 2, executor));
    } else if (promise->isResolved()) {
      // Promise is already resolved - just return immediately
      jsi::Object promiseObject = runtime.global().getPropertyAsObject(runtime, "Promise");
      jsi::Function createResolvedPromise = promiseObject.getPropertyAsFunction(runtime, "resolve");
      if constexpr (std::is_void_v<TResult>) {
        // It's resolving to void.
        return createResolvedPromise.call(runtime);
      } else {
        // It's resolving to a type.
        jsi::Value result = JSIConverter<TResult>::toJSI(runtime, promise->getResult());
        return createResolvedPromise.call(runtime, std::move(result));
      }
    } else if (promise->isRejected()) {
      // Promise is already rejected - just return immediately
      jsi::Object promiseObject = runtime.global().getPropertyAsObject(runtime, "Promise");
      jsi::Function createRejectedPromise = promiseObject.getPropertyAsFunction(runtime, "reject");
      jsi::Value error = JSIConverter<std::exception_ptr>::toJSI(runtime, promise->getError());
      return createRejectedPromise.call(runtime, std::move(error));
    } else {
      throw std::runtime_error("Promise has invalid state!");
    }
  }

  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) {
      return false;
    }
    jsi::Object object = value.getObject(runtime);
    return object.hasProperty(runtime, "then");
  }
};

} // namespace margelo::nitro
