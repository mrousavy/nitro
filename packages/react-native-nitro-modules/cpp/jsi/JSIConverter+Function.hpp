//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
class JSICache;

template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "Dispatcher.hpp"
#include "JSCallback.hpp"
#include "JSICache.hpp"
#include "PromiseType.hpp"
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

// [](Args...) -> T {} <> (Args...) => T
template <typename ReturnType, typename... Args>
struct JSIConverter<std::function<ReturnType(Args...)>> final {
  // Promise<T> -> T
  using ResultingType = std::conditional_t<is_promise_v<ReturnType>, promise_type_v<ReturnType>, ReturnType>;

  static inline std::function<ReturnType(Args...)> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    // Make function global - it'll be managed by the Runtime's memory, and we only have a weak_ref to it.
    auto cache = JSICache::getOrCreateCache(runtime);
    jsi::Function function = arg.asObject(runtime).asFunction(runtime);
    BorrowingReference<jsi::Function> sharedFunction = cache.makeShared(std::move(function));
    SyncJSCallback<ResultingType(Args...)> callback(runtime, std::move(sharedFunction));

    if constexpr (is_promise_v<ReturnType> || std::is_void_v<ReturnType>) {
      // Return type is `Promise<T>` or `void` - it's an async callback!
      std::shared_ptr<Dispatcher> dispatcher = Dispatcher::getRuntimeGlobalDispatcher(runtime);
      return AsyncJSCallback<ResultingType(Args...)>(std::move(callback), dispatcher);
    } else {
      // Return type is `T` - it's a sync callback!
      return callback;
    }
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, std::function<ReturnType(Args...)>&& function) {
    jsi::HostFunctionType jsFunction = [function = std::move(function)](jsi::Runtime& runtime, const jsi::Value&, const jsi::Value* args,
                                                                        size_t count) -> jsi::Value {
      if (count != sizeof...(Args)) [[unlikely]] {
        throw jsi::JSError(runtime, "Function expected " + std::to_string(sizeof...(Args)) + " arguments, but received " +
                                        std::to_string(count) + "!");
      }
      return callHybridFunction(function, runtime, args, std::index_sequence_for<Args...>{});
    };
    return jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, "hostFunction"), sizeof...(Args),
                                                 std::move(jsFunction));
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::function<ReturnType(Args...)>& function) {
    std::function<ReturnType(Args...)> copy = function;
    return toJSI(runtime, std::move(copy));
  }

  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (value.isObject()) {
      jsi::Object object = value.getObject(runtime);
      return object.isFunction(runtime);
    }
    return false;
  }

private:
  template <size_t... Is>
  static inline jsi::Value callHybridFunction(const std::function<ReturnType(Args...)>& function, jsi::Runtime& runtime,
                                              const jsi::Value* args, std::index_sequence<Is...>) {
    throw std::runtime_error("nope");
  }
};

} // namespace margelo::nitro
