//
//  JSICache.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 20.06.24.
//

#pragma once

#include <jsi/jsi.h>
#include <memory>
#include <vector>
#include <unordered_map>
#include "OwningReference.hpp"
#include "BorrowingReference.hpp"
#include "NitroLogger.hpp"
#include "JSIUtils.h"

namespace margelo::nitro {

using namespace facebook;

static constexpr auto CACHE_PROP_NAME = "__nitroModulesJSICache";

/**
 Safely holds `jsi::Pointer` instances (e.g. `jsi::Object` or `jsi::Function`), managed by a `jsi::Runtime`.
 */
template<typename T = jsi::Pointer>
class JSICache final: public jsi::NativeState {
public:
  explicit JSICache(jsi::Runtime* runtime) : _runtime(runtime) {}
  
  ~JSICache() {
    // TODO: Do we need to throw Mutexes on OwningReference so there are no race conditions with nullchecks and then pointer accessses while we delete the pointer?
    for (auto& func : _cache) {
      OwningReference<T> owning = func.lock();
      if (owning) {
        // Destroy all functions that we might still have in cache, some callbacks and Promises may now become invalid.
        owning.destroy();
      }
    }
  }

public:
  /**
   Gets or creates a `JSICache` for the given `jsi::Runtime`.
   To access the cache, try to `.lock()` the returned `weak_ptr`.
   If it can be locked, you can access data in the cache. Otherwise the Runtime has already been deleted.
   Do not hold the returned `shared_ptr` in memory, only use it in the calling function's scope.
   */
  static std::weak_ptr<JSICache<T>> getOrCreateCache(jsi::Runtime& runtime) {
    if (_globalCache.contains(&runtime)) {
      // Fast path: get weak_ptr to JSICache from our global list.
      return _globalCache[&runtime];
    }

    // Cache doesn't exist yet.
    Logger::log(TAG, "Creating new JSICache<T> for runtime %i..", getRuntimeId(runtime));
    // Create new cache
    auto nativeState = std::make_shared<JSICache<T>>(&runtime);
    // Wrap it in a jsi::Value using NativeState
    jsi::Object cache(runtime);
    cache.setNativeState(runtime, nativeState);
    // Inject it into the jsi::Runtime's global so it's memory is managed by it
    runtime.global().setProperty(runtime, CACHE_PROP_NAME, std::move(cache));
    // Add it to our map of caches
    _globalCache[&runtime] = nativeState;
    // Return it
    return nativeState;
  }

public:
  /**
   Creates a reference to a `jsi::Value` that can be stored in memory and accessed later.
   The `jsi::Value` will be managed by the `jsi::Runtime`, if the `jsi::Runtime` gets the destroyed,
   so will the `jsi::Value`.

   To access the `jsi::Value`, try to `.lock()` the `weak_ptr`.
   If it can be locked, it is still valid, otherwise the Runtime has already been deleted.
   Do not hold the returned `shared_ptr` in memory, only use it in the calling function's scope.
   Note: By design, this is not thread-safe, the returned `weak_ptr` must only be locked on the same thread as it was created on.
   */
  OwningReference<T> makeGlobal(T&& value) {
    auto owning = OwningReference<T>(new T(std::move(value)));
    _cache.push_back(owning.weak());
    return owning;
  }

private:
  jsi::Runtime* _runtime;
  std::vector<BorrowingReference<T>> _cache;
  
private:
  static inline std::unordered_map<jsi::Runtime*, std::weak_ptr<JSICache<T>>> _globalCache;

private:
  static constexpr auto TAG = "JSICache";
};


} // namespace margelo::nitro
