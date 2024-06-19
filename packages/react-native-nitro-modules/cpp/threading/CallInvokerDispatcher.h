//
// Created by Marc Rousavy on 27.03.24.
//

#pragma once

#include "Dispatcher.h"
#include <ReactCommon/CallInvoker.h>

namespace margelo {

using namespace facebook;

/**
 * A Dispatcher that uses react::CallInvoker for it's implementation
 */
class CallInvokerDispatcher : public Dispatcher {
public:
  explicit CallInvokerDispatcher(std::shared_ptr<react::CallInvoker> callInvoker) : _callInvoker(callInvoker) {}

  void runAsync(std::function<void()>&& function) override {
    _callInvoker->invokeAsync(std::move(function));
  }

  void runSync(std::function<void()>&& function) override {
    _callInvoker->invokeSync(std::move(function));
  }

private:
  std::shared_ptr<react::CallInvoker> _callInvoker;
};

} // namespace margelo
