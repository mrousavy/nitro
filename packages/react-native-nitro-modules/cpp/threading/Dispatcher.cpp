#include "Dispatcher.hpp"
#include "NitroLogger.hpp"

namespace margelo::nitro {

using namespace facebook;

static constexpr auto GLOBAL_DISPATCHER_HOLDER_NAME = "__nitroDispatcher";

std::unordered_map<jsi::Runtime*, std::weak_ptr<Dispatcher>> Dispatcher::_globalCache;

void Dispatcher::installRuntimeGlobalDispatcher(jsi::Runtime& runtime, std::shared_ptr<Dispatcher> dispatcher) {
  Logger::log(TAG, "Installing global Dispatcher Holder...");

  // Store a weak reference in global cache
  _globalCache[&runtime] = std::weak_ptr(dispatcher);

  // Inject the dispatcher into Runtime global (runtime will hold a strong reference)
  jsi::Object dispatcherHolder(runtime);
  dispatcherHolder.setNativeState(runtime, dispatcher);
  runtime.global().setProperty(runtime, GLOBAL_DISPATCHER_HOLDER_NAME, dispatcherHolder);
}

std::shared_ptr<Dispatcher> Dispatcher::getRuntimeGlobalDispatcher(jsi::Runtime& runtime) {
  if (_globalCache.contains(&runtime)) [[likely]] {
    // the runtime is known - we have something in cache
    std::weak_ptr<Dispatcher> weakDispatcher = _globalCache[&runtime];
    std::shared_ptr<Dispatcher> strongDispatcher = weakDispatcher.lock();
    if (strongDispatcher) {
      // the weak reference we cached is still valid - return it!
      return strongDispatcher;
    }
  }

  jsi::Value dispatcherHolderValue = getRuntimeGlobalDispatcherHolder(runtime);
  jsi::Object dispatcherHolder = dispatcherHolderValue.getObject(runtime);
  return dispatcherHolder.getNativeState<Dispatcher>(runtime);
}

jsi::Value Dispatcher::getRuntimeGlobalDispatcherHolder(jsi::Runtime& runtime) {
#if DEBUG
  if (!runtime.global().hasProperty(runtime, GLOBAL_DISPATCHER_HOLDER_NAME)) {
    throw std::runtime_error("Failed to get current Dispatcher - the global Dispatcher "
                                "holder (global." +
                                    std::string(GLOBAL_DISPATCHER_HOLDER_NAME) +
                                    ") "
                                    "does not exist! Was Dispatcher::installDispatcherIntoRuntime() called "
                                    "for this jsi::Runtime?");
  }
#endif
  return runtime.global().getProperty(runtime, GLOBAL_DISPATCHER_HOLDER_NAME);
}

} // namespace margelo::nitro
