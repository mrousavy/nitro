//
//  NativeNitroModules.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#include "NativeNitroModules.hpp"
#include "TestHybridObject.hpp"
#include "SwiftTestHybridObject.hpp"
#include "Dispatcher.hpp"
#include "CallInvokerDispatcher.hpp"

namespace facebook::react {

using namespace margelo;

NativeNitroModules::NativeNitroModules(std::shared_ptr<CallInvoker> jsInvoker) : NativeNitroCxxSpec(jsInvoker), _callInvoker(jsInvoker) {
}

NativeNitroModules::~NativeNitroModules() { }

void NativeNitroModules::install(jsi::Runtime& runtime) {
  // Installs the global Dispatcher mechanism into this Runtime.
  // This allows creating Promises and calling back to JS.
  auto dispatcher = std::make_shared<CallInvokerDispatcher>(_callInvoker);
  Dispatcher::installRuntimeGlobalDispatcher(runtime, dispatcher);
}

jsi::Object NativeNitroModules::createTestHybridObject(jsi::Runtime &runtime) {
  auto hybrid = std::make_shared<TestHybridObject>();
  return jsi::Object::createFromHostObject(runtime, hybrid);
}

jsi::Object NativeNitroModules::createSwiftTestHybridObject(jsi::Runtime &runtime) {
  auto hybrid = std::make_shared<SwiftTestHybridObject>();
  return jsi::Object::createFromHostObject(runtime, hybrid);
}

}
