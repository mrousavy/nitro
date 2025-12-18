//
//  JSICache.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 20.06.24.
//

#include "JSICache.hpp"
#include "CommonGlobals.hpp"
#include "JSIHelpers.hpp"
#include "NitroDefines.hpp"

namespace margelo::nitro {

template <typename T>
inline void destroyReferences(const std::vector<WeakReference<T>>& references) {
  for (auto& func : references) {
    BorrowingReference<T> reference = func.lock();
    if (reference) {
      // Destroy all functions that we might still have in cache, some callbacks and Promises may now become invalid.
      reference.destroy();
    }
  }
}

JSICache::~JSICache() {
  Logger::log(LogLevel::Info, TAG, "Destroying JSICache...");
  std::unique_lock lock(_mutex);

  destroyReferences(_valueCache);
  destroyReferences(_objectCache);
  destroyReferences(_functionCache);
  destroyReferences(_weakObjectCache);
  destroyReferences(_arrayBufferCache);
}

JSICacheReference JSICache::getOrCreateCache(jsi::Runtime& runtime) {
  auto found = _globalCache.find(&runtime);
  if (found != _globalCache.end()) [[likely]] {
    // Fast path: get weak_ptr to JSICache from our global list.
    std::weak_ptr<JSICache> weak = found->second;
    std::shared_ptr<JSICache> strong = weak.lock();
    if (strong) {
      // It's still alive! Return it
      return JSICacheReference(strong);
    }
    Logger::log(LogLevel::Warning, TAG, "JSICache was created, but it is no longer strong!");
  }

  // Cache doesn't exist yet.
  Logger::log(LogLevel::Info, TAG, "Creating new JSICache<T> for runtime %s..", getRuntimeId(runtime).c_str());
  // Create new cache
  std::shared_ptr<JSICache> nativeState(new JSICache());
  // Wrap it in a jsi::Value using NativeState
  jsi::Object cache(runtime);
  cache.setNativeState(runtime, nativeState);
  // Inject it into the jsi::Runtime's global so it's memory is managed by it.
  // We pass `allowCache = false` because we are the JSICache, and this would cause recursion.
  CommonGlobals::defineGlobal(runtime, KnownGlobalPropertyName::JSI_CACHE, std::move(cache), /* allowCache */ false);
  // Add it to our map of caches
  _globalCache[&runtime] = nativeState;
  // Return it
  return JSICacheReference(nativeState);
}

} // namespace margelo::nitro
