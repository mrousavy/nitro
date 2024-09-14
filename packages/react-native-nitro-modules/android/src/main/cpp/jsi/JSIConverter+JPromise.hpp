//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "Dispatcher.hpp"
#include "JPromise.hpp"
#include "JSIConverter.hpp"
#include "JSPromise.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

// Promise <> JPromise
template <>
struct JSIConverter<JPromise::javaobject> final {
  static inline jni::alias_ref<JPromise::javaobject> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    throw std::runtime_error("Promise cannot be converted to a native type - it needs to be awaited first!");
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<JPromise::javaobject>& arg) {
    std::shared_ptr<Dispatcher> strongDispatcher = Dispatcher::getRuntimeGlobalDispatcher(runtime);
    std::weak_ptr<Dispatcher> weakDispatcher = strongDispatcher;

    jni::global_ref<JPromise::javaobject> javaPromise = jni::make_global(arg);

    return JSPromise::createPromise(runtime, [weakDispatcher, javaPromise](jsi::Runtime& runtime, std::shared_ptr<JSPromise> promise) {
      // on resolved listener
      javaPromise->cthis()->addOnResolvedListener([&runtime, weakDispatcher, promise](jni::alias_ref<jni::JObject> result) {
        std::shared_ptr<Dispatcher> dispatcher = weakDispatcher.lock();
        if (!dispatcher) {
          Logger::log(LogLevel::Error, "JSIConverter",
                      "Tried resolving Promise on JS Thread, but the `Dispatcher` has already been destroyed!");
          return;
        }
        jni::global_ref<jni::JObject> javaResult = jni::make_global(result);
        dispatcher->runAsync([&runtime, promise, javaResult]() {
          // TODO: Figure out how to JSIConverter::toJSI(...) the javaResult type here now...
          promise->reject(runtime, "TODO: I don't know how to convert javaResult to jsi::Value now. It is boxed in a JObject...");
        });
      });
      // on rejected listener
      javaPromise->cthis()->addOnRejectedListener([&runtime, weakDispatcher, promise](jni::alias_ref<jni::JString> errorMessage) {
        std::shared_ptr<Dispatcher> dispatcher = weakDispatcher.lock();
        if (!dispatcher) {
          Logger::log(LogLevel::Error, "JSIConverter",
                      "Tried rejecting Promise on JS Thread, but the `Dispatcher` has already been destroyed!");
          return;
        }
        jni::global_ref<jni::JString> javaError = jni::make_global(errorMessage);
        dispatcher->runAsync([&runtime, promise, javaError]() { promise->reject(runtime, javaError->toStdString()); });
      });
    });
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    throw std::runtime_error("jsi::Value of type Promise cannot be converted to JPromise yet!");
  }
};

} // namespace margelo::nitro