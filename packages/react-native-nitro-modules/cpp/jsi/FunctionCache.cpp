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
  if (runtime.global().hasProperty(runtime, CACHE_PROP_NAME)) {
    // A cache already exists for the given runtime - get it and return a weak ref to it.
    Logger::log(TAG, "Runtime %i already has a cache, getting it..", getRuntimeId(runtime));
    auto cache = runtime.global().getPropertyAsObject(runtime, CACHE_PROP_NAME);
    auto nativeState = cache.getNativeState<FunctionCache>(runtime);
    return std::weak_ptr(nativeState);
  }

  // Cache doesn't exist yet - create one, inject it into global, and return a weak ref.
  Logger::log(TAG, "Creating new FunctionCache for runtime %i..", getRuntimeId(runtime));
  auto nativeState = std::make_shared<FunctionCache>(&runtime);
  jsi::Object cache(runtime);
  cache.setNativeState(runtime, nativeState);
  runtime.global().setProperty(runtime, CACHE_PROP_NAME, std::move(cache));
  return std::weak_ptr(nativeState);
}

std::weak_ptr<jsi::Function> FunctionCache::makeGlobal(jsi::Function&& function) {
  auto shared = std::make_shared<jsi::Function>(function);
  _cache.push_back(shared);
  return std::weak_ptr(shared);
}

}
