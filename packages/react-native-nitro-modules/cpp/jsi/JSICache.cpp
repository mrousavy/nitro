//
//  JSICache.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 20.06.24.
//

#include "JSICache.hpp"

namespace margelo::nitro {

static constexpr auto CACHE_PROP_NAME = "__nitroModulesJSICache";

JSICache::~JSICache() {
  Logger::log(TAG, "Destroying JSICache...");
  std::unique_lock lock(_mutex);

  for (auto& func : _cache) {
    OwningReference<jsi::Object> owning = func.lock();
    if (owning) {
      // Destroy all functions that we might still have in cache, some callbacks and Promises may now become invalid.
      owning.destroy();
    }
  }
}

JSICacheReference JSICache::getOrCreateCache(jsi::Runtime& runtime) {
  auto found = _globalCache.find(&runtime);
  if (found != _globalCache.end()) {
    // Fast path: get weak_ptr to JSICache from our global list.
    std::weak_ptr<JSICache> weak = found->second;
    std::shared_ptr<JSICache> strong = weak.lock();
    if (strong) {
      // It's still alive! Return it
      return JSICacheReference(strong);
    }
    Logger::log(TAG, "JSICache was created, but it is no longer strong!");
  }

  // Cache doesn't exist yet.
  Logger::log(TAG, "Creating new JSICache<T> for runtime %s..", getRuntimeId(runtime));
  // Create new cache
  auto nativeState = std::make_shared<JSICache>(&runtime);
  // Wrap it in a jsi::Value using NativeState
  jsi::Object cache(runtime);
  cache.setNativeState(runtime, nativeState);
  // Inject it into the jsi::Runtime's global so it's memory is managed by it
  runtime.global().setProperty(runtime, CACHE_PROP_NAME, std::move(cache));
  // Add it to our map of caches
  _globalCache[&runtime] = nativeState;
  // Return it
  return JSICacheReference(nativeState);
}

} // namespace margelo::nitro
