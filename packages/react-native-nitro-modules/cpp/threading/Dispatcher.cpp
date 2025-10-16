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

/**
 * This map is only statically linked once to this library.
 * If multiple versions of react-native-nitro-modules are linked, there would be multiple maps. We catch that issue later.
 */
std::unordered_map<jsi::Runtime * NON_NULL, std::weak_ptr<Dispatcher>> Dispatcher::_globalCache;

void Dispatcher::installRuntimeGlobalDispatcher(jsi::Runtime& runtime, std::shared_ptr<Dispatcher> dispatcher) {
  Logger::log(LogLevel::Info, TAG, "Installing global Dispatcher Holder into Runtime \"%s\"...", getRuntimeId(runtime).c_str());

  // Store a weak reference in global cache
  _globalCache[&runtime] = dispatcher;

  // Inject the dispatcher into Runtime global (runtime will hold a strong reference)
  jsi::Object dispatcherHolder(runtime);
  dispatcherHolder.setNativeState(runtime, dispatcher);
  runtime.global().setProperty(runtime, GLOBAL_DISPATCHER_HOLDER_NAME, std::move(dispatcherHolder));
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
  // 1. Get global.__nitroDispatcher
  jsi::Value dispatcherHolderValue = getRuntimeGlobalDispatcherHolder(runtime);
  // 2. Cast it to the jsi::Object
  jsi::Object dispatcherHolder = dispatcherHolderValue.asObject(runtime);
  // 3. Check if it has a `NativeState`
  if (!dispatcherHolder.hasNativeState(runtime)) [[unlikely]] {
    throw std::runtime_error("Failed to get the global `Dispatcher` - the value exists on `global." +
                             std::string(GLOBAL_DISPATCHER_HOLDER_NAME) + "`, but it doesn't contain any `NativeState`!");
  }
  // 4. Get the `NativeState` (without downcasting)
  std::shared_ptr<jsi::NativeState> dispatcherBoxed = dispatcherHolder.getNativeState(runtime);
  // 5. Downcast `NativeState` to `Dispatcher` (this only fails if we linked it twice)
  std::shared_ptr<Dispatcher> dispatcher = std::dynamic_pointer_cast<Dispatcher>(dispatcherBoxed);
  // 6. Ensure the downcast succeeded - if not, Nitro might be linked twice (`Dispatcher` is a duplicate symbol)
  if (dispatcher == nullptr) [[unlikely]] {
    throw std::runtime_error("Failed to downcast the global `Dispatcher` - it has a `NativeState`, but it's not `NativeState<Dispatcher>`. "
                             "Is react-native-nitro-modules linked twice? "
                             "Is `Dispatcher` a duplicate symbol in your binary? "
                             "Ensure your build process does not cause duplicate symbols.");
  }
  // 7. Throw it in our cache and return
  _globalCache[&runtime] = dispatcher;
  return dispatcher;
}

jsi::Value Dispatcher::getRuntimeGlobalDispatcherHolder(jsi::Runtime& runtime) {
  if (!runtime.global().hasProperty(runtime, GLOBAL_DISPATCHER_HOLDER_NAME)) [[unlikely]] {
    throw std::runtime_error("The `jsi::Runtime` \"" + getRuntimeId(runtime) +
                             "\" does not support Callbacks or Promises because it does not have a `Dispatcher` installed!\n"
                             "To use Callbacks and Promises follow these steps;\n"
                             "1. Subclass `Dispatcher` with your implementation of `runAsync`/`runSync` for your Thread.\n"
                             "2. Call `Dispatcher::installRuntimeGlobalDispatcher(...)` with your `Runtime` and your `Dispatcher`.");
  }
  return runtime.global().getProperty(runtime, GLOBAL_DISPATCHER_HOLDER_NAME);
}

} // namespace margelo::nitro
