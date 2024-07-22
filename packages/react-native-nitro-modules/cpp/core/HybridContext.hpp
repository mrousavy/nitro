//
//  HybridContext.hpp
//  Pods
//
//  Created by Marc Rousavy on 17.07.24.
//

#pragma once

#include <memory>
#include "NitroLogger.hpp"

namespace margelo::nitro {

class HybridObject;

/**
 * Represents contextual state for a `HybridObject`.
 *
 * This can be used in remote implementations, e.g. in a Swift implementation
 * to properly (weak-)reference the `HybridObject` instead of re-creating it each time.
 */
struct HybridContext final {
public:
  std::weak_ptr<HybridObject> cppPart;
  
public:
  template<typename THybridObject, typename TSwiftPart>
  static std::shared_ptr<THybridObject> getOrCreate(TSwiftPart swiftPart) {
    auto hybridContext = swiftPart.getHybridContext();
    auto hybridObject = std::static_pointer_cast<THybridObject>(hybridContext.cppPart.lock());
    if (hybridObject == nullptr) {
      Logger::log(TAG, "Creating new HybridContext...");
      hybridObject = std::make_shared<THybridObject>(swiftPart);
      hybridContext.cppPart = hybridObject;
      swiftPart.setHybridContext(hybridContext);
    } else {
      Logger::log(TAG, "Re-using existing HybridContext from cache.");
    }
    return hybridObject;
  }
  
private:
  static constexpr auto TAG = "HybridContext";
};

} // namespace margelo::nitro
