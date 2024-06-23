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

FunctionCache::~FunctionCache() {
  // TODO: Do we need to throw Mutexes on OwningReference so there are no race conditions with nullchecks and then pointer accessses while we delete the pointer?
  for (auto& func : _cache) {
    OwningReference<jsi::Function> owning = func.lock();
    if (owning) {
      // Destroy all functions that we might still have in cache, some callbacks and Promises may now become invalid.
      owning.destroy();
    }
  }
}

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

OwningReference<jsi::Function> FunctionCache::makeGlobal(jsi::Function&& function) {
  auto owning = OwningReference<jsi::Function>(new jsi::Function(std::move(function)));
  _cache.push_back(owning.weak());
  return owning;
}

}
