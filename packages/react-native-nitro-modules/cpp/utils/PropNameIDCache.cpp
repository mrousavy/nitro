//
//  PropNameIDCache.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 17.10.25.
//

#pragma once

#include "PropNameIDCache.hpp"
#include "JSICache.hpp"

namespace margelo::nitro {

using namespace facebook;

BorrowingReference<jsi::PropNameID> PropNameIDCache::get(jsi::Runtime& runtime, std::string value) {
  CacheMap& cache = _cache[&runtime];
  const auto& cachedName = cache.find(value);
  if (cachedName != cache.end()) {
    // cache warm!
    return cachedName->second;
  }
  
  // not cached - create the jsi::PropNameID...
  auto propName = jsi::PropNameID::forAscii(runtime, value);
  auto jsiCache = JSICache::getOrCreateCache(runtime);
  auto sharedPropName = jsiCache.makeShared(std::move(propName));
  
  // store it in cache...
  cache.emplace(value, sharedPropName);
  
  // return it!
  return sharedPropName;
}

} // namespace margelo::nitro
