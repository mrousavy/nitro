//
//  Dispatcher.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 22.07.24.
//

#include "Dispatcher.hpp"
#include "JSIHelpers.hpp"
#include "NitroDefines.hpp"
#include "NitroLogger.hpp"

namespace margelo::nitro {

using namespace facebook;

static constexpr auto GLOBAL_DISPATCHER_HOLDER_NAME = "__nitroDispatcher";

std::unordered_map<jsi::Runtime*, std::weak_ptr<Dispatcher>> Dispatcher::_globalCache;

void Dispatcher::installRuntimeGlobalDispatcher(jsi::Runtime& runtime, std::shared_ptr<Dispatcher> dispatcher) {
  Logger::log(LogLevel::Info, TAG, "Installing global Dispatcher Holder into Runtime \"%s\"...", getRuntimeId(runtime).c_str());

  // Store a weak reference in global cache
  _globalCache[&runtime] = dispatcher;

  // Inject the dispatcher into Runtime global (runtime will hold a strong reference)
  jsi::Object dispatcherHolder(runtime);
  dispatcherHolder.setNativeState(runtime, dispatcher);
  runtime.global().setProperty(runtime, GLOBAL_DISPATCHER_HOLDER_NAME, dispatcherHolder);
}

std::shared_ptr<Dispatcher> Dispatcher::getRuntimeGlobalDispatcher(jsi::Runtime& runtime) {
  auto found = _globalCache.find(&runtime);
  if (found != _globalCache.end()) [[likely]] {
    // the runtime is known - we have something in cache
    std::weak_ptr<Dispatcher> weakDispatcher = found->second;
    std::shared_ptr<Dispatcher> strongDispatcher = weakDispatcher.lock();
    if (strongDispatcher) {
      // the weak reference we cached is still valid - return it!
      return strongDispatcher;
    }
  }

  Logger::log(LogLevel::Warning, TAG, "Unknown Runtime (%s), looking for Dispatcher through JSI global lookup...",
              getRuntimeId(runtime).c_str());
  jsi::Value dispatcherHolderValue = getRuntimeGlobalDispatcherHolder(runtime);
  jsi::Object dispatcherHolder = dispatcherHolderValue.getObject(runtime);
  std::shared_ptr<Dispatcher> dispatcher = dispatcherHolder.getNativeState<Dispatcher>(runtime);
  _globalCache[&runtime] = dispatcher;
  return dispatcher;
}

jsi::Value Dispatcher::getRuntimeGlobalDispatcherHolder(jsi::Runtime& runtime) {
#ifdef NITRO_DEBUG
  if (!runtime.global().hasProperty(runtime, GLOBAL_DISPATCHER_HOLDER_NAME)) [[unlikely]] {
    throw std::runtime_error("Failed to get current Dispatcher - the global Dispatcher "
                             "holder (`global." +
                             std::string(GLOBAL_DISPATCHER_HOLDER_NAME) +
                             "`) "
                             "does not exist! Was `Dispatcher::installDispatcherIntoRuntime()` called "
                             "for this `jsi::Runtime`?");
  }
#endif
  return runtime.global().getProperty(runtime, GLOBAL_DISPATCHER_HOLDER_NAME);
}

} // namespace margelo::nitro
