#include "Dispatcher.hpp"
#include "Logger.hpp"

namespace margelo {

using namespace facebook;

static constexpr auto GLOBAL_DISPATCHER_HOLDER_NAME = "__globalDispatcher";

void Dispatcher::installRuntimeGlobalDispatcher(jsi::Runtime& runtime, std::shared_ptr<Dispatcher> dispatcher) {
  Logger::log(TAG, "Installing global Dispatcher Holder...");

  jsi::Object dispatcherHolder(runtime);
  dispatcherHolder.setNativeState(runtime, dispatcher);
  runtime.global().setProperty(runtime, GLOBAL_DISPATCHER_HOLDER_NAME, dispatcherHolder);
}

std::shared_ptr<Dispatcher> Dispatcher::getRuntimeGlobalDispatcher(jsi::Runtime& runtime) {
  jsi::Value dispatcherHolderValue = getRuntimeGlobalDispatcherHolder(runtime);
  jsi::Object dispatcherHolder = dispatcherHolderValue.getObject(runtime);
  return dispatcherHolder.getNativeState<Dispatcher>(runtime);
}

jsi::Value Dispatcher::getRuntimeGlobalDispatcherHolder(jsi::Runtime& runtime) {
#if DEBUG
  if (!runtime.global().hasProperty(runtime, GLOBAL_DISPATCHER_HOLDER_NAME)) {
    throw jsi::JSError(runtime, "Failed to get current Dispatcher - the global Dispatcher "
                                "holder (global." +
                                    std::string(GLOBAL_DISPATCHER_HOLDER_NAME) +
                                    ") "
                                    "does not exist! Was Dispatcher::installDispatcherIntoRuntime() called "
                                    "for this jsi::Runtime?");
  }
#endif
  return runtime.global().getProperty(runtime, GLOBAL_DISPATCHER_HOLDER_NAME);
}

} // namespace margelo
