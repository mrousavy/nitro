//
//  RegisterNativeNitroModules.cpp
//  DoubleConversion
//
//  Created by Marc Rousavy on 21.06.24.
//

#include "RegisterNativeNitroModules.hpp"
#include "NativeNitroModules.hpp"
#include <memory>
#include <string>

#if __has_include(<ReactCommon/CallInvoker.h>)
// Android style imports
#include <ReactCommon/CallInvoker.h>
#include <ReactCommon/CxxTurboModuleUtils.h>
#else
// iOS style imports
#include <React-callinvoker/ReactCommon/CallInvoker.h>
#include <ReactCommon/ReactCommon/CxxTurboModuleUtils.h>
#endif

namespace margelo::nitro {

using namespace facebook;

void RegisterNativeNitroModules::registerNativeNitroModules() {
  react::registerCxxModuleToGlobalModuleMap(
      std::string(react::NativeNitroModules::kModuleName),
      [&](std::shared_ptr<react::CallInvoker> jsInvoker) { return std::make_shared<react::NativeNitroModules>(jsInvoker); });
}

} // namespace margelo::nitro
