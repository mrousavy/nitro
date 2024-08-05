//
//  JSICache.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 20.06.24.
//

#pragma once

#include "BorrowingReference.hpp"
#include "GetRuntimeID.hpp"
#include "NitroLogger.hpp"
#include "OwningReference.hpp"
#include <jsi/jsi.h>
#include <memory>
#include <mutex>
#include <unordered_map>
#include <vector>

namespace margelo::nitro {

using namespace facebook;

class JSICacheReference;

/**
 * A `JSICache` can safely store `jsi::Object` instances (e.g. `jsi::Object` or
 * `jsi::Function`) inside `OwningReference<T>`.
 *
 * `jsi::Pointer`s are managed by a `jsi::Runtime`, and will be deleted if the `jsi::Runtime`
 * is deleted - even if there are still strong references to the `jsi::Pointer`.
 */
class JSICache final : public jsi::NativeState {
public:
  explicit JSICache(jsi::Runtime* runtime) : _runtime(runtime) {}
  ~JSICache();

public:
  JSICache() = delete;
  JSICache(const JSICache&) = delete;
  JSICache(JSICache&&) = delete;

public:
  /**
   Gets or creates a `JSICache` for the given `jsi::Runtime`.
   The returned `shared_ptr` should not be stored in
   If it can be locked, you can access data in the cache. Otherwise the Runtime has already been deleted.
   Do not hold the returned `shared_ptr` in memory, only use it in the calling function's scope.
   */
  [[nodiscard]]
  static JSICacheReference getOrCreateCache(jsi::Runtime& runtime);

private:
  friend class JSICacheReference;

private:
  jsi::Runtime* _runtime;
  std::mutex _mutex;
  std::vector<BorrowingReference<jsi::Object>> _cache;

private:
  static inline std::unordered_map<jsi::Runtime*, std::weak_ptr<JSICache>> _globalCache;

private:
  static constexpr auto TAG = "JSICache";
};

class JSICacheReference final {
public:
  JSICacheReference() = delete;
  JSICacheReference(const JSICacheReference&) = delete;
  JSICacheReference(JSICacheReference&&) = delete;

  ~JSICacheReference() {
    _strongCache->_mutex.unlock();
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
  template <typename T>
  OwningReference<T> makeGlobal(T&& value) {
    OwningReference<jsi::Object> owning(new T(std::move(value)));
    _strongCache->_cache.push_back(owning.weak());
    return owning.as<T>();
  }

private:
  explicit JSICacheReference(const std::shared_ptr<JSICache>& cache) : _strongCache(cache) {
    _strongCache->_mutex.lock();
  }

private:
  std::shared_ptr<JSICache> _strongCache;

  friend class JSICache;
};

} // namespace margelo::nitro
