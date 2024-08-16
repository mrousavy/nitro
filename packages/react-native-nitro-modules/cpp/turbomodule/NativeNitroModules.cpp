//
//  NativeNitroModules.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#include "NativeNitroModules.hpp"
#include "CallInvokerDispatcher.hpp"
#include "Dispatcher.hpp"
#include "HybridObjectRegistry.hpp"

namespace facebook::react {

using namespace margelo::nitro;

NativeNitroModules::NativeNitroModules(std::shared_ptr<CallInvoker> jsInvoker)
    : TurboModule(kModuleName, jsInvoker), _callInvoker(jsInvoker) {}

NativeNitroModules::~NativeNitroModules() {}

jsi::Value NativeNitroModules::get(jsi::Runtime& runtime, const jsi::PropNameID& propName) {
  std::string name = propName.utf8(runtime);

  if (name == "install") {
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, "install"), 0,
        [this](jsi::Runtime& runtime, const jsi::Value& thisArg, const jsi::Value* args, size_t count) -> jsi::Value {
          install(runtime);
          return jsi::Value::undefined();
        });
  }
  if (name == "createHybridObject") {
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, "createHybridObject"), 2,
        [this](jsi::Runtime& runtime, const jsi::Value& thisArg, const jsi::Value* args, size_t count) -> jsi::Value {
#if DEBUG
          if (count != 1 && count != 2) [[unlikely]] {
            throw jsi::JSError(runtime, "NitroModules.createHybridObject(..) expects 1 or 2 arguments, but " + std::to_string(count) +
                                            " were supplied!");
          }
#endif
          jsi::String objectName = args[0].asString(runtime);
          std::optional<jsi::Object> optionalArgs = std::nullopt;
          if (count > 1) {
            optionalArgs = args[1].asObject(runtime);
          }

          return createHybridObject(runtime, objectName, optionalArgs);
        });
  }
  if (name == "hasHybridObject") {
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, "hasHybridObject"), 1,
        [this](jsi::Runtime& runtime, const jsi::Value& thisArg, const jsi::Value* args, size_t count) -> jsi::Value {
#if DEBUG
          if (count != 1) [[unlikely]] {
            throw jsi::JSError(runtime,
                               "NitroModules.hasHybridObject(..) expects 1 argument (name), but received " + std::to_string(count) + "!");
          }
#endif
          jsi::String objectName = args[0].asString(runtime);
          return hasHybridObject(runtime, objectName);
        });
  }
  if (name == "getAllHybridObjectNames") {
    return jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, "getAllHybridObjectNames"), 0,
                                                 [this](jsi::Runtime& runtime, const jsi::Value& thisArg, const jsi::Value* args,
                                                        size_t count) -> jsi::Value { return getAllHybridObjectNames(runtime); });
  }

  return jsi::Value::undefined();
}

void NativeNitroModules::install(jsi::Runtime& runtime) {
  // Installs the global Dispatcher mechanism into this Runtime.
  // This allows creating Promises and calling back to JS.
  auto dispatcher = std::make_shared<CallInvokerDispatcher>(_callInvoker);
  Dispatcher::installRuntimeGlobalDispatcher(runtime, dispatcher);
}

jsi::Value NativeNitroModules::createHybridObject(jsi::Runtime& runtime, const jsi::String& hybridObjectName,
                                                  const std::optional<jsi::Object>&) {
  auto name = hybridObjectName.utf8(runtime);
  // TODO: Pass args? Do we need that?
  auto hybridObject = HybridObjectRegistry::createHybridObject(name.c_str());
  return hybridObject->toObject(runtime);
}

jsi::Value NativeNitroModules::hasHybridObject(jsi::Runtime& runtime, const jsi::String& hybridObjectName) {
  std::string name = hybridObjectName.utf8(runtime);
  bool exists = HybridObjectRegistry::hasHybridObject(name);
  return exists;
}

jsi::Value NativeNitroModules::getAllHybridObjectNames(jsi::Runtime& runtime) {
  std::vector<std::string> keys = HybridObjectRegistry::getAllHybridObjectNames();
  jsi::Array array(runtime, keys.size());
  for (size_t i = 0; i < keys.size(); i++) {
    array.setValueAtIndex(runtime, i, jsi::String::createFromUtf8(runtime, keys[i]));
  }
  return array;
}

} // namespace facebook::react
