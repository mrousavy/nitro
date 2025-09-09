#include "JSPromise.hpp"
#include "JSICache.hpp"
#include "JSIConverter.hpp"

namespace margelo::nitro {

jsi::Value JSPromise::create(jsi::Runtime& runtime, jsi::Function&& execute) {
  // Call new Promise(...) constructor
  auto& constructor = getPromiseConstructorFromCache(runtime);
  return constructor->callAsConstructor(runtime, std::move(execute));
}

jsi::Value JSPromise::resolved(jsi::Runtime& runtime) {
  // Call Promise.resolve()
  auto& rejected = getPromiseResolveFromCache(runtime);
  return rejected->call(runtime);
}
jsi::Value JSPromise::resolved(jsi::Runtime& runtime, jsi::Value&& result) {
  // Call Promise.resolve(...)
  auto& rejected = getPromiseResolveFromCache(runtime);
  return rejected->call(runtime, std::move(result));
}

jsi::Value JSPromise::rejected(jsi::Runtime& runtime, jsi::Value&& error) {
  // Call Promise.reject(...)
  auto& rejected = getPromiseRejectFromCache(runtime);
  return rejected->call(runtime, std::move(error));
}

BorrowingReference<jsi::Function>& JSPromise::getPromiseConstructorFromCache(jsi::Runtime& runtime) {
  BorrowingReference<jsi::Function>& cachedFunc = _constructorsCache[&runtime];
  if (cachedFunc == nullptr) {
    // We don't have global.Promise(...) cached - look it up
    jsi::Function constructor = runtime.global().getPropertyAsFunction(runtime, "Promise");
    auto cache = JSICache::getOrCreateCache(runtime);
    cachedFunc = cache.makeShared(std::move(constructor));
    _constructorsCache[&runtime] = cachedFunc;
  }
  return cachedFunc;
}
BorrowingReference<jsi::Function>& JSPromise::getPromiseResolveFromCache(jsi::Runtime& runtime) {
  BorrowingReference<jsi::Function>& cachedFunc = _resolvedCache[&runtime];
  if (cachedFunc == nullptr) {
    // We don't have global.Promise.resolve cached - look it up
    jsi::Object promise = runtime.global().getPropertyAsObject(runtime, "Promise");
    jsi::Function resolved = promise.getPropertyAsFunction(runtime, "resolve");
    auto cache = JSICache::getOrCreateCache(runtime);
    cachedFunc = cache.makeShared(std::move(resolved));
    _resolvedCache[&runtime] = cachedFunc;
  }
  return cachedFunc;
}
BorrowingReference<jsi::Function>& JSPromise::getPromiseRejectFromCache(jsi::Runtime& runtime) {
  BorrowingReference<jsi::Function>& cachedFunc = _rejectedCache[&runtime];
  if (cachedFunc == nullptr) {
    // We don't have global.Promise.reject cached - look it up
    jsi::Object promise = runtime.global().getPropertyAsObject(runtime, "Promise");
    jsi::Function resolved = promise.getPropertyAsFunction(runtime, "reject");
    auto cache = JSICache::getOrCreateCache(runtime);
    cachedFunc = cache.makeShared(std::move(resolved));
    _rejectedCache[&runtime] = cachedFunc;
  }
  return cachedFunc;
}

} // namespace margelo::nitro
