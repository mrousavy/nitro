//
//  PromiseFactory.hpp
//  react-native-filament
//
//  Created by Marc Rousavy on 11.03.24.
//

#pragma once

#include "Promise.h"
#include "threading/Dispatcher.h"
#include <jsi/jsi.h>
#include <memory>

namespace margelo {

class PromiseFactory {
public:
  using RunPromise = std::function<void(jsi::Runtime& runtime, std::shared_ptr<Promise> promise, std::shared_ptr<Dispatcher> dispatcher)>;

  /**
   Create a new promise and run the given function.
   The caller needs to ensure that the Promise is resolved eventually (on the JS thread with the CallInvoker).
   */
  static jsi::Value createPromise(jsi::Runtime& runtime, RunPromise&& run);

private:
  static constexpr auto TAG = "PromiseFactory";

private:
  PromiseFactory() = delete;
};

} // namespace margelo
