//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {

template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"
#include "JSPromise.hpp"
#include "NitroTypeInfo.hpp"
#include "Promise.hpp"
#include <exception>
#include <jsi/jsi.h>
#include <memory>

namespace margelo::nitro {

using namespace facebook;

// Promise<T, std::exception> <> Promise<T>
template <typename TResult>
struct JSIConverter<std::shared_ptr<Promise<TResult>>> final {
  static inline std::shared_ptr<Promise<TResult>> fromJSI(jsi::Runtime& runtime, const jsi::Value& value) {
    // Create new Promise and prepare onResolved / onRejected callbacks
    auto promise = Promise<TResult>::create();
    auto thenCallback = [&]() {
      if constexpr (std::is_void_v<TResult>) {
        // void: resolve()
        // note: this has to still take 1 argument (just std::monostate/undefined), because the Promise.then(..) func needs an argument.
        return JSIConverter<std::function<void(std::monostate)>>::toJSI(runtime, [=](std::monostate) { promise->resolve(); });
      } else {
        // T: resolve(T)
        return JSIConverter<std::function<void(TResult)>>::toJSI(runtime, [=](const TResult& result) { promise->resolve(result); });
      }
    }();
    auto catchCallback = JSIConverter<std::function<void(std::exception_ptr)>>::toJSI(
        runtime, [=](const std::exception_ptr& exception) { promise->reject(exception); });

    // Chain .then listeners on JS Promise (onResolved and onRejected)
    jsi::Object jsPromise = value.asObject(runtime);
    jsi::Function thenFn = jsPromise.getPropertyAsFunction(runtime, "then");
    thenFn.callWithThis(runtime, jsPromise, thenCallback, catchCallback);

    return promise;
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::shared_ptr<Promise<TResult>>& promise) {
    if (promise->isPending()) {
      //
      //
      // Promise is still pending, we need to attach listeners (.then & .catch)
      //
      //
      jsi::HostFunctionType executor = [promise](jsi::Runtime& runtime, const jsi::Value&, const jsi::Value* arguments,
                                                 size_t) -> jsi::Value {
        // Add resolver listener
        if constexpr (std::is_void_v<TResult>) {
          // It's resolving to void.
          auto resolver = JSIConverter<std::function<void()>>::fromJSI(runtime, arguments[0]);
          promise->addOnResolvedListener(std::move(resolver));
        } else {
          // It's a type.
          auto resolver = JSIConverter<std::function<void(TResult)>>::fromJSI(runtime, arguments[0]);
          promise->addOnResolvedListener(std::move(resolver));
        }
        // Add rejecter listener
        auto rejecter = JSIConverter<std::function<void(std::exception_ptr)>>::fromJSI(runtime, arguments[1]);
        promise->addOnRejectedListener(std::move(rejecter));

        return jsi::Value::undefined();
      };
      // Call `Promise` constructor (aka create promise), and pass `executor` function
      jsi::Function executorFunc =
          jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, "executor"), 2, executor);
      return JSPromise::create(runtime, std::move(executorFunc));
    } else if (promise->isResolved()) {
      //
      //
      // Promise is already resolved - just return immediately
      //
      //
      if constexpr (std::is_void_v<TResult>) {
        // It's resolving to void.
        return JSPromise::resolved(runtime);
      } else {
        // It's resolving to a type.
        jsi::Value result = JSIConverter<TResult>::toJSI(runtime, promise->getResult());
        return JSPromise::resolved(runtime, std::move(result));
      }
    } else if (promise->isRejected()) {
      //
      //
      // Promise is already rejected - just return immediately
      //
      //
      jsi::Value error = JSIConverter<std::exception_ptr>::toJSI(runtime, promise->getError());
      return JSPromise::rejected(runtime, std::move(error));
    } else {
      std::string typeName = TypeInfo::getFriendlyTypename<TResult>(true);
      throw std::runtime_error("Promise<" + typeName + "> has invalid state!");
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
