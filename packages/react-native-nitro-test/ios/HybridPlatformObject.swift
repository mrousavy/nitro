//
//  HybridPlatformObject.swift
//  react-native-nitro-test
//
//  Created by Marc Rousavy on 27.10.25.
//

import UIKit

struct ReactModuleAccessError: Error, CustomStringConvertible {
  let description: String
}

class HybridPlatformObject: HybridPlatformObjectSpec {
  func getOSVersion() -> String {
    return UIDevice.current.systemVersion
  }

  // Get the RN "BlobModule" from inside a Nitro HybridObject and use it.
  // Android: `NitroModules.applicationContext.getNativeModule(BlobModule::class.java)`.
  // iOS: there is no `NitroModules.applicationContext`; the only entry point is the
  // private `RCTBridge.currentBridge` (called dynamically below), which is nil under
  // the New Architecture (bridgeless) — so there is nothing to call.
  func getReactContextInfo() throws -> String {
    let bridge = (NSClassFromString("RCTBridge") as AnyObject?)?
      .perform(NSSelectorFromString("currentBridge"))?
      .takeUnretainedValue()
    guard let bridge else {
      throw ReactModuleAccessError(
        description: "RCTBridge.currentBridge == nil (bridgeless): a Nitro HybridObject cannot reach BlobModule or any RN native module on iOS")
    }
    let blobModule = (bridge as AnyObject)
      .perform(NSSelectorFromString("moduleForName:"), with: "BlobModule")?
      .takeUnretainedValue()
    return "iOS reached BlobModule = \(String(describing: blobModule))"
  }
}
