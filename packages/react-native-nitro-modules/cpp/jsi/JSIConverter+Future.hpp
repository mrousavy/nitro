//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
class Dispatcher;

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
  static inline std::future<TResult> fromJSI(jsi::Runtime&, const jsi::Value&) {
    throw std::runtime_error("Promise cannot be converted to a native type - it needs to be awaited first!");
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, std::future<TResult>&& arg) {
    auto promise = Promise<TResult>::awaitFuture(std::move(arg));
    return JSIConverter<std::shared_ptr<Promise<TResult>>>::toJSI(runtime, promise);
  }

  static inline bool canConvert(jsi::Runtime&, const jsi::Value&) {
    throw std::runtime_error("jsi::Value of type Promise cannot be converted to std::future yet!");
  }
};

} // namespace margelo::nitro
