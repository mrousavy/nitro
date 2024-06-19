//
// Created by Marc Rousavy on 12.03.24.
//

#pragma once

#include <functional>
#include <future>
#include <jsi/jsi.h>
#include <queue>

namespace margelo {

using namespace facebook;

class Dispatcher : public jsi::NativeState {
public:
  /**
   Installs the Dispatcher into the given Runtime.
   It can be accessed using `getRuntimeGlobalDispatcher` later.
   */
  static void installRuntimeGlobalDispatcher(jsi::Runtime& runtime, std::shared_ptr<Dispatcher> dispatcher);
  /**
   Gets the global Dispatcher in the given Runtime, or throws an error if not found.
  */
  static std::shared_ptr<Dispatcher> getRuntimeGlobalDispatcher(jsi::Runtime& runtime);
  static jsi::Value getRuntimeGlobalDispatcherHolder(jsi::Runtime& runtime);

public:
  /**
   * Run the given void function synchronously on the Thread this Dispatcher is managing.
   */
  virtual void runSync(std::function<void()>&& function) = 0;

  /**
   * Run the given void function asynchronously on the Thread this Dispatcher is managing.
   */
  virtual void runAsync(std::function<void()>&& function) = 0;

  /**
   * Run the given function asynchronously on the Thread this Dispatcher is managing,
   * and return a future that will hold the result of the function.
   */
  template <typename T> std::future<T> runAsyncAwaitable(std::function<T()>&& function) {
    // 1. Create Promise that can be shared between this and dispatcher thread
    auto promise = std::make_shared<std::promise<T>>();
    std::future<T> future = promise->get_future();

    runAsync([function = std::move(function), promise]() {
      try {
        if constexpr (std::is_void<T>()) {
          // 4. Call the actual function on the new Thread
          function();
          // 5.a. Resolve the Promise if we succeeded
          promise->set_value();
        } else {
          // 4. Call the actual function on the new Thread
          T result = function();
          // 5.a. Resolve the Promise if we succeeded
          promise->set_value(std::move(result));
        }
      } catch (...) {
        // 5.b. Reject the Promise if the call failed
        promise->set_exception(std::current_exception());
      }
    });

    // 3. Return an open future that gets resolved later by the dispatcher Thread
    return future;
  }

private:
  static constexpr auto TAG = "Dispatcher";
};

} // namespace margelo
