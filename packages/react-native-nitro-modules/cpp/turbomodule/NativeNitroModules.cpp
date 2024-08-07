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
        [=](jsi::Runtime& runtime, const jsi::Value& thisArg, const jsi::Value* args, size_t count) -> jsi::Value {
          install(runtime);
          return jsi::Value::undefined();
        });
  }
  if (name == "createHybridObject") {
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, "install"), 2,
        [=](jsi::Runtime& runtime, const jsi::Value& thisArg, const jsi::Value* args, size_t count) -> jsi::Value {
          if (count != 1 && count != 2) {
            throw jsi::JSError(runtime, "NitroModules.createHybridObject(..) expects 1 or 2 arguments, but " + std::to_string(count) +
                                            " were supplied!");
          }
          jsi::String objectName = args[0].asString(runtime);
          std::optional<jsi::Object> optionalArgs = std::nullopt;
          if (count > 1) {
            optionalArgs = args[1].asObject(runtime);
          }

          return createHybridObject(runtime, objectName, optionalArgs);
        });
  }

  return jsi::Value::undefined();
}

void NativeNitroModules::install(jsi::Runtime& runtime) {
  // Installs the global Dispatcher mechanism into this Runtime.
  // This allows creating Promises and calling back to JS.
  auto dispatcher = std::make_shared<CallInvokerDispatcher>(_callInvoker);
  Dispatcher::installRuntimeGlobalDispatcher(runtime, dispatcher);
}

jsi::Object NativeNitroModules::createHybridObject(jsi::Runtime& runtime, const jsi::String& hybridObjectName,
                                                   const std::optional<jsi::Object>& args) {
  auto name = hybridObjectName.utf8(runtime);
  // TODO: Pass args? Do we need that?
  auto hybridObject = HybridObjectRegistry::createHybridObject(name.c_str());
  // TODO: Either return jsi::Object in toObject directly, or have this method return jsi::Value?
  return hybridObject->toObject(runtime).asObject(runtime);
}

} // namespace facebook::react
