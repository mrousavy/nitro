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

#include "Promise.hpp"
#include <future>
#include <jsi/jsi.h>
#include <memory>

namespace margelo::nitro {

using namespace facebook;

// std::future<T> <> Promise<T>
template <typename TResult>
struct JSIConverter<std::future<TResult>> final {
  [[deprecated("Use JSIConverter<std::shared_ptr<Promise<T>>> instead.")]]
  static inline std::future<TResult> fromJSI(jsi::Runtime&, const jsi::Value&) {
    auto promise = JSIConverter<std::shared_ptr<Promise<TResult>>>::fromJSI(runtime, promise);
    return promise->await();
  }

  [[deprecated("Use JSIConverter<std::shared_ptr<Promise<T>>> instead.")]]
  static inline jsi::Value toJSI(jsi::Runtime& runtime, std::future<TResult>&& arg) {
    auto promise = Promise<TResult>::awaitFuture(std::move(arg));
    return JSIConverter<std::shared_ptr<Promise<TResult>>>::toJSI(runtime, promise);
  }

  [[deprecated("Use JSIConverter<std::shared_ptr<Promise<T>>> instead.")]]
  static inline bool canConvert(jsi::Runtime&, const jsi::Value&) {
    return JSIConverter<std::shared_ptr<Promise<TResult>>>::canConvert(runtime, promise);
  }
};

} // namespace margelo::nitro
