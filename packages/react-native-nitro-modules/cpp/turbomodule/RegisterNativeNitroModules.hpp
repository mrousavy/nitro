//
//  RegisterNativeNitroModules.hpp
//  DoubleConversion
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

namespace margelo {

class RegisterNativeNitroModules {
public:
  /**
   Registers the native NitroModules TurboModule into the React Runtime.
   This can be called from Swift/Objective-C.
   */
  static void registerNativeNitroModules();
};

} // namespace margelo
