//
//  NativeNitroModules.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#include "NativeNitroModules.hpp"
#include "TestHybridObject.hpp"
#include "Dispatcher.hpp"
#include "CallInvokerDispatcher.hpp"
#include "HybridObjectRegistry.hpp"

namespace facebook::react {

using namespace margelo::nitro;

NativeNitroModules::NativeNitroModules(std::shared_ptr<CallInvoker> jsInvoker) : NativeNitroCxxSpec(jsInvoker), _callInvoker(jsInvoker) {
}

NativeNitroModules::~NativeNitroModules() { }

void NativeNitroModules::install(jsi::Runtime& runtime) {
  // Installs the global Dispatcher mechanism into this Runtime.
  // This allows creating Promises and calling back to JS.
  auto dispatcher = std::make_shared<CallInvokerDispatcher>(_callInvoker);
  Dispatcher::installRuntimeGlobalDispatcher(runtime, dispatcher);
}

jsi::Object NativeNitroModules::createHybridObject(jsi::Runtime& runtime,
                                                   jsi::String hybridObjectName,
                                                   std::optional<jsi::Object> args) {
  auto name = hybridObjectName.utf8(runtime);
  // TODO: Pass args? Do we need that?
  auto hybridObject = HybridObjectRegistry::createHybridObject(name.c_str());
  return jsi::Object::createFromHostObject(runtime, hybridObject);
}

}
