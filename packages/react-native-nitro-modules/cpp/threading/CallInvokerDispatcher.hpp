//
// Created by Marc Rousavy on 27.03.24.
//

#pragma once

#include "Dispatcher.hpp"

// This is react-native specific
#if __has_include(<React-callinvoker/ReactCommon/CallInvoker.h>)
#include <React-callinvoker/ReactCommon/CallInvoker.h>
#include <React-callinvoker/ReactCommon/SchedulerPriority.h>

namespace margelo::nitro {

using namespace facebook;

/**
 * A Dispatcher that uses react::CallInvoker for it's implementation
 */
class CallInvokerDispatcher final : public Dispatcher {
public:
  explicit CallInvokerDispatcher(std::shared_ptr<react::CallInvoker> callInvoker) : _callInvoker(callInvoker) {}

  void runAsync(Priority priority, std::function<void()>&& function) override {
    _callInvoker->invokeAsync(std::move(function));
  }

  void runSync(Priority priority, std::function<void()>&& function) override {
    _callInvoker->invokeSync(std::move(function));
  }

private:
  static react::SchedulerPriority nitroPriorityToReactPriority(Dispatcher::Priority priority) {
    switch (priority) {
      case Dispatcher::Priority::ImmediatePriority:
        return react::SchedulerPriority::ImmediatePriority;
      case Dispatcher::Priority::UserBlockingPriority:
        return react::SchedulerPriority::UserBlockingPriority;
      case Dispatcher::Priority::NormalPriority:
        return react::SchedulerPriority::NormalPriority;
      case Dispatcher::Priority::LowPriority:
        return react::SchedulerPriority::LowPriority;
      case Dispatcher::Priority::IdlePriority:
        return react::SchedulerPriority::IdlePriority;
    }
  }

private:
  std::shared_ptr<react::CallInvoker> _callInvoker;
};

} // namespace margelo::nitro

#endif
