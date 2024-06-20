//
//  FunctionCache.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 20.06.24.
//

#include "FunctionCache.hpp"
#include "NitroLogger.hpp"
#include "JSIUtils.h"

namespace margelo {

static constexpr auto CACHE_PROP_NAME = "__nitroModulesFunctionCache";

FunctionCache::FunctionCache(jsi::Runtime* runtime): _runtime(runtime) {}

std::weak_ptr<FunctionCache> FunctionCache::getOrCreateCache(jsi::Runtime &runtime) {
  if (_globalCache.contains(&runtime)) {
    // Fast path: get weak_ptr to FunctionCache from our global list.
    return _globalCache[&runtime];
  }

  // Cache doesn't exist yet.
  Logger::log(TAG, "Creating new FunctionCache for runtime %i..", getRuntimeId(runtime));
  // Create new cache
  auto nativeState = std::make_shared<FunctionCache>(&runtime);
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

std::weak_ptr<jsi::Function> FunctionCache::makeGlobal(jsi::Function&& function) {
  auto shared = std::make_shared<jsi::Function>(function);
  _cache.push_back(shared);
  return std::weak_ptr(shared);
}

}
