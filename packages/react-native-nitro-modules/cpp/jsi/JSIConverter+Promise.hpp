//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
class Dispatcher;

class JSPromise;

template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"

#include "Dispatcher.hpp"
#include "JSPromise.hpp"
#include "ThreadPool.hpp"
#include "TypeInfo.hpp"
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
    auto sharedFuture = std::make_shared<std::future<TResult>>(std::move(arg));
    std::shared_ptr<Dispatcher> strongDispatcher = Dispatcher::getRuntimeGlobalDispatcher(runtime);
    std::weak_ptr<Dispatcher> weakDispatcher = strongDispatcher;

    return JSPromise::createPromise(runtime, [sharedFuture, weakDispatcher](jsi::Runtime& runtime, std::shared_ptr<JSPromise> promise) {
      // Spawn new async thread to synchronously wait for the `future<T>` to complete
      std::shared_ptr<ThreadPool> pool = ThreadPool::getSharedPool();
      pool->run([promise, &runtime, weakDispatcher, sharedFuture]() {
        // synchronously wait until the `future<T>` completes. we are running on a background task here.
        sharedFuture->wait();

        // the async function completed successfully, get a JS Dispatcher so we can resolve on JS Thread
        std::shared_ptr<Dispatcher> dispatcher = weakDispatcher.lock();
        if (!dispatcher) {
          Logger::log("JSIConverter", "Tried resolving Promise on JS Thread, but the `Dispatcher` has already been destroyed.");
          return;
        }

        dispatcher->runAsync([&runtime, promise, sharedFuture]() mutable {
          try {
            if constexpr (std::is_void_v<TResult>) {
              // it's returning void, just return undefined to JS
              sharedFuture->get();
              promise->resolve(runtime, jsi::Value::undefined());
            } else {
              // it's returning a custom type, convert it to a jsi::Value
              TResult result = sharedFuture->get();
              jsi::Value jsResult = JSIConverter<TResult>::toJSI(runtime, result);
              promise->resolve(runtime, std::move(jsResult));
            }
          } catch (const std::exception& exception) {
            // the async function threw an error, reject the promise on JS Thread
            std::string what = exception.what();
            promise->reject(runtime, what);
          } catch (...) {
            // the async function threw a non-std error, try getting it
            std::string name = TypeInfo::getCurrentExceptionName();
            promise->reject(runtime, "Unknown non-std exception: " + name);
          }

          // This lambda owns the promise shared pointer, and we need to call its
          // destructor on the correct thread here - otherwise it might be called
          // from the waiterThread.
          promise = nullptr;
        });
      });
    });
  }

  static inline bool canConvert(jsi::Runtime&, const jsi::Value&) {
    throw std::runtime_error("jsi::Value of type Promise cannot be converted to std::future yet!");
  }
};

} // namespace margelo::nitro
