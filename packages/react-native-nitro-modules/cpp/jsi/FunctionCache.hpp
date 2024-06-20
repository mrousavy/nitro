//
//  FunctionCache.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 20.06.24.
//

#pragma once

#include <jsi/jsi.h>
#include <memory>
#include <vector>

namespace margelo {

using namespace facebook;

/**
 Safely holds `jsi::Function` instances, managed by a `jsi::Runtime`.
 */
class FunctionCache: public jsi::NativeState {
public:
  explicit FunctionCache(jsi::Runtime* runtime);

public:
  /**
   Gets or creates a `FunctionCache` for the given `jsi::Runtime`.
   To access the cache, try to `.lock()` the returned `weak_ptr`.
   If it can be locked, you can access data in the cache. Otherwise the Runtime has already been deleted.
   Do not hold the returned `shared_ptr` in memory, only use it in the calling function's scope.
   */
  static std::weak_ptr<FunctionCache> getOrCreateCache(jsi::Runtime& runtime);

public:
  /**
   Creates a reference to a `jsi::Function` that can be stored in memory and accessed later.
   The `jsi::Function` will be managed by the `jsi::Runtime`, if the `jsi::Runtime` gets the destroyed,
   so will the `jsi::Function`.
   
   To access the `jsi::Function`, try to `.lock()` the `weak_ptr`.
   If it can be locked, it is still valid, otherwise the Runtime has already been deleted.
   Do not hold the returned `shared_ptr` in memory, only use it in the calling function's scope.
   Note: By design, this is not thread-safe, the returned `weak_ptr` must only be locked on the same thread as it was created on.
   */
  std::weak_ptr<jsi::Function> makeGlobal(jsi::Function&& function);

private:
  jsi::Runtime* _runtime;
  std::vector<std::shared_ptr<jsi::Function>> _cache;
  static constexpr auto TAG = "FunctionCache";
};


} // namespace margelo
