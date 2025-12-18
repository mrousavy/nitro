//
//  PropNameIDCache.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 17.10.25.
//

#pragma once

#include "BorrowingReference.hpp"
#include <jsi/jsi.h>
#include <unordered_map>

namespace margelo::nitro {

using namespace facebook;

class PropNameIDCache final {
public:
  PropNameIDCache() = delete;
  ~PropNameIDCache() = delete;

  static BorrowingReference<jsi::PropNameID> get(jsi::Runtime& runtime, std::string value);
  
private:
  using CacheMap = std::unordered_map<std::string, BorrowingReference<jsi::PropNameID>>;
  static std::unordered_map<jsi::Runtime*, CacheMap> _cache;
};

} // namespace margelo::nitro
