//
// Created by Marc Rousavy on 22.02.25.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename Signature>
class Callback;
template <typename Signature>
class NativeCallback;
template <typename Signature>
class JSCallback;

template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"

#include "Callback.hpp"
#include "JSICache.hpp"
#include <jsi/jsi.h>
#include <memory>

namespace margelo::nitro {

using namespace facebook;

// Callback<R(A...)> <> jsi::Function
template <typename ReturnType, typename... Args>
struct JSIConverter<Callback<ReturnType(Args...)>> final {
  static inline Callback<ReturnType(Args...)> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    // 1. Convert arg to jsi::Function
    jsi::Function function = arg.asObject(runtime).asFunction(runtime);
    // 2. Make it a BorrowingReference
    auto cache = JSICache::getOrCreateCache(runtime);
    auto reference = cache.makeShared(std::move(function));
    // 3. Get the Dispatcher
    auto dispatcher = Dispatcher::getRuntimeGlobalDispatcher(runtime);
    // 4. Create the callback
    return Callback<ReturnType(Args...)>(runtime, reference, dispatcher);
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const Callback<ReturnType(Args...)>& callback) {
    jsi::HostFunctionType func = [callback](jsi::Runtime& runtime, const jsi::Value& thisArg, const jsi::Value* args,
                                            size_t count) -> jsi::Value { throw std::runtime_error("Not yet implemented!"); };

    return jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forAscii(runtime, "nativeFunction"), sizeof...(Args),
                                                 std::move(func));
  }

  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject())
      return false;
    jsi::Object object = value.getObject(runtime);
    return object.isFunction(runtime);
  }
};

} // namespace margelo::nitro
