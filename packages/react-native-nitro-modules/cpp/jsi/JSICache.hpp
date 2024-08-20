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
 * A `JSICache` can safely store `jsi::Value` instances (e.g. `jsi::Object` or
 * `jsi::Function`) inside `OwningReference<T>`.
 *
 * `jsi::Value`s are managed by a `jsi::Runtime`, and will be deleted if the `jsi::Runtime`
 * is deleted - even if there are still strong references to the `jsi::Value`.
 *
 * To access a `OwningReference<jsi::Value>` safely, use `lock()` to get an `OwningLock<jsi::Value>`.
 * This will allow you to access the `jsi::Value` as long as the `OwningLock` is alive,
 * and `JSICache` will hold any garbage collection calls until the `OwningLock` is destroyed.
 */
class JSICache final : public jsi::NativeState {
public:
  ~JSICache();

public:
  JSICache(const JSICache&) = delete;
  JSICache(JSICache&&) = delete;

private:
  JSICache() = default;

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
  std::mutex _mutex;
  std::vector<BorrowingReference<jsi::Object>> _objectCache;
  std::vector<BorrowingReference<jsi::Function>> _functionCache;
  std::vector<BorrowingReference<jsi::WeakObject>> _weakObjectCache;
  std::vector<BorrowingReference<jsi::ArrayBuffer>> _arrayBufferCache;

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
  OwningReference<jsi::Object> makeShared(jsi::Object&& value) {
    OwningReference<jsi::Object> owning(new jsi::Object(std::move(value)));
    _strongCache->_objectCache.push_back(owning.weak());
    return owning;
  }
  OwningReference<jsi::Function> makeShared(jsi::Function&& value) {
    OwningReference<jsi::Function> owning(new jsi::Function(std::move(value)));
    _strongCache->_functionCache.push_back(owning.weak());
    return owning;
  }
  OwningReference<jsi::WeakObject> makeShared(jsi::WeakObject&& value) {
    OwningReference<jsi::WeakObject> owning(new jsi::WeakObject(std::move(value)));
    _strongCache->_weakObjectCache.push_back(owning.weak());
    return owning;
  }
  OwningReference<jsi::ArrayBuffer> makeShared(jsi::ArrayBuffer&& value) {
    OwningReference<jsi::ArrayBuffer> owning(new jsi::ArrayBuffer(std::move(value)));
    _strongCache->_arrayBufferCache.push_back(owning.weak());
    return owning;
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
