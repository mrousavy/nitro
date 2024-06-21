//
//  RegisterNativeNitroModules.cpp
//  DoubleConversion
//
//  Created by Marc Rousavy on 21.06.24.
//

#include "RegisterNativeNitroModules.hpp"
#include "NativeNitroModules.hpp"
#include <React-callinvoker/ReactCommon/CallInvoker.h>
#include <ReactCommon/ReactCommon/CxxTurboModuleUtils.h>

namespace margelo {

void RegisterNativeNitroModules::registerNativeNitroModules() {
  facebook::react::registerCxxModuleToGlobalModuleMap(
      std::string(facebook::react::NativeNitroModules::kModuleName),
      [&](std::shared_ptr<facebook::react::CallInvoker> jsInvoker) {
        return std::make_shared<facebook::react::NativeNitroModules>(jsInvoker);
      });
}

}
