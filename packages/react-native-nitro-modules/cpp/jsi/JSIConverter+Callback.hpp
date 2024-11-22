//
// Created by Marc Rousavy on 20.11.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
class JSICache;

template <typename T, typename Enable>
struct JSIConverter;

template <typename Signature>
class Callback;
} // namespace margelo::nitro

#include "JSIConverter.hpp"

#include "Callback.hpp"
#include "JSICache.hpp"
#include "NitroDefines.hpp"
#include <functional>
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

// [](Args...) -> T {} <> (Args...) => T
template <typename ReturnType, typename... Args>
struct JSIConverter<Callback<ReturnType(Args...)>> final {
  static inline JSCallback<ReturnType(Args...)> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    // Make function global - it'll be managed by the Runtime's memory, and we only have a weak_ref to it.
    auto cache = JSICache::getOrCreateCache(runtime);
    jsi::Function function = arg.asObject(runtime).asFunction(runtime);
    OwningReference<jsi::Function> sharedFunction = cache.makeShared(std::move(function));

    std::shared_ptr<Dispatcher> strongDispatcher = Dispatcher::getRuntimeGlobalDispatcher(runtime);

#ifdef NITRO_DEBUG
    std::string functionName = "dummy"; // function.getProperty(runtime, "name").getString(runtime).utf8(runtime);
    return JSCallback<ReturnType(Args...)>(&runtime, std::move(sharedFunction), strongDispatcher, functionName);
#else
    return JSCallback<ReturnType(Args...)>(&runtime, std::move(sharedFunction), strongDispatcher);
#endif
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const Callback<ReturnType(Args...)>& function) {
    jsi::HostFunctionType jsFunction = [function](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* args,
                                                  size_t count) -> jsi::Value {
      if (count != sizeof...(Args)) [[unlikely]] {
        throw jsi::JSError(runtime, "Function expected " + std::to_string(sizeof...(Args)) + " arguments, but received " +
                                        std::to_string(count) + "!");
      }
      return callHybridFunction(function, runtime, args, std::index_sequence_for<Args...>{});
    };
    return jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, function.getName()), sizeof...(Args),
                                                 jsFunction);
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
  static inline jsi::Value callHybridFunction(const Callback<ReturnType(Args...)>& function, jsi::Runtime& runtime, const jsi::Value* args,
                                              std::index_sequence<Is...>) {
    if constexpr (std::is_void_v<ReturnType>) {
      // it is a void function (will return undefined in JS)
      function.callSync(JSIConverter<std::decay_t<Args>>::fromJSI(runtime, args[Is])...);
      return jsi::Value::undefined();
    } else {
      // it is a custom type, parse it to a JS value
      ReturnType result = function.callSync(JSIConverter<std::decay_t<Args>>::fromJSI(runtime, args[Is])...);
      return JSIConverter<ReturnType>::toJSI(runtime, std::forward<ReturnType>(result));
    }
  }
};

} // namespace margelo::nitro
