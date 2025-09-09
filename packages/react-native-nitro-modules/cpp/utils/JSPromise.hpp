//
//  JSPromise.hpp
//  Nitro
//
//  Created by Marc Rousavy on 09.09.25.
//

#pragma once

#include <jsi/jsi.h>
#include <unordered_map>
#include "BorrowingReference.hpp"

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents the JSI functions for `Promise` creation.
 */
class JSPromise {
public:
  JSPromise() = delete;
  ~JSPromise() = delete;
  
  static jsi::Value create(jsi::Runtime& runtime, jsi::Function&& execute);
  static jsi::Value resolved(jsi::Runtime& runtime);
  static jsi::Value resolved(jsi::Runtime& runtime, jsi::Value&& result);
  static jsi::Value rejected(jsi::Runtime& runtime, jsi::Value&& error);
  
private:
  static BorrowingReference<jsi::Function>& getPromiseConstructorFromCache(jsi::Runtime& runtime);
  static BorrowingReference<jsi::Function>& getPromiseResolveFromCache(jsi::Runtime& runtime);
  static BorrowingReference<jsi::Function>& getPromiseRejectFromCache(jsi::Runtime& runtime);

private:
  static std::unordered_map<jsi::Runtime*, BorrowingReference<jsi::Function>> _constructorsCache;
  static std::unordered_map<jsi::Runtime*, BorrowingReference<jsi::Function>> _resolvedCache;
  static std::unordered_map<jsi::Runtime*, BorrowingReference<jsi::Function>> _rejectedCache;
};

} // namespace margelo::nitro
