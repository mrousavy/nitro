//
//  JSICache.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 20.06.24.
//

#pragma once

#include "BorrowingReference.hpp"
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
 * `jsi::Object`s are managed by a `jsi::Runtime`, and will be deleted if the `jsi::Runtime`
 * is deleted - even if there are still strong references to the `jsi::Object`.
 *
 * To access a `OwningReference<jsi::Object>` safely, use `lock()` to get an `OwningLock<jsi::Object>`.
 * This will allow you to access the `jsi::Object` as long as the `OwningLock` is alive,
 * and `JSICache` will hold any garbage collection calls until the `OwningLock` is destroyed.
 */
class JSICache final : public jsi::NativeState {
public:
  ~JSICache();

public:
  JSICache() = delete;
  JSICache(const JSICache&) = delete;
  JSICache(JSICache&&) = delete;

private:
  explicit JSICache(jsi::Runtime* runtime) : _runtime(runtime) {}

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
   * Creates a semi-strong reference to a `jsi::Object` that can be stored in memory and accessed later.
   *
   * The returned `OwningReference<T>` keeps the `T` semi-strong, and once it gets deleted, `T` will also be freed.
   *
   * Note: The JS Runtime can still delete `T` at any point (e.g. when it gets destroyed or reloaded),
   * so any operations on `T` should be under an `OwningLock<T>`.
   *
   * To get an `OwningLock<T>` (which implies safe access to `T`), call `.locK()` on the `OwningReference<T>`.
   * This will hold off any JS Runtime GC calls that will destroy `T` for as long as the `OwningLock<T>` is alive.
   */
  template <typename T>
  OwningReference<T> makeShared(T&& value) {
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
