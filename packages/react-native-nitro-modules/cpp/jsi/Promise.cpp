#include "Promise.hpp"
#include "JSICache.hpp"
#include "NitroLogger.hpp"
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

Promise::Promise(jsi::Runtime& runtime, jsi::Function&& resolver, jsi::Function&& rejecter) {
  auto functionCache = JSICache<jsi::Function>::getOrCreateCache(runtime);
  _resolver = functionCache.makeGlobal(std::move(resolver));
  _rejecter = functionCache.makeGlobal(std::move(rejecter));
}

jsi::Value Promise::createPromise(jsi::Runtime& runtime, RunPromise&& run) {
  // Get Promise ctor from global
  auto promiseCtor = runtime.global().getPropertyAsFunction(runtime, "Promise");

  auto promiseCallback = jsi::Function::createFromHostFunction(
      runtime, jsi::PropNameID::forUtf8(runtime, "PromiseCallback"), 2,
      [run = std::move(run)](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        // Get resolver and rejecter
        auto resolver = arguments[0].getObject(runtime).getFunction(runtime);
        auto rejecter = arguments[1].getObject(runtime).getFunction(runtime);
        // Create `Promise` type that wraps the JSI callbacks
        auto promise = std::make_shared<Promise>(runtime, std::move(resolver), std::move(rejecter));
        // Call `run` callback
        run(runtime, promise);

        return jsi::Value::undefined();
      });

  return promiseCtor.callAsConstructor(runtime, promiseCallback);
}

void Promise::resolve(jsi::Runtime& runtime, jsi::Value&& result) {
  if (!_resolver) {
    Logger::log(TAG, "Promise resolver function has already been deleted! Ignoring call..");
    return;
  }
  _resolver->call(runtime, std::move(result));
}

void Promise::reject(jsi::Runtime& runtime, std::string message) {
  if (!_rejecter) {
    Logger::log(TAG, "Promise rejecter function has already been deleted! Ignoring call..");
    return;
  }
  jsi::JSError error(runtime, message);
  _rejecter->call(runtime, error.value());
}

} // namespace margelo::nitro
