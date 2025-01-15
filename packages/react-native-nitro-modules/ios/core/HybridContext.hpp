//
//  HybridContext.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 17.07.24.
//

#pragma once

namespace margelo::nitro {
class HybridObject;
}

#include "HybridObject.hpp"
#include "NitroLogger.hpp"
#include "NitroTypeInfo.hpp"
#include <memory>

namespace margelo::nitro {

/**
 * Represents contextual state for a `HybridObject`.
 *
 * This can be used in remote implementations, e.g. in a Swift implementation
 * to properly (weak-)reference the `HybridObject` instead of re-creating it each time.
 */
struct [[deprecated("Update Nitrogen and re-generate your specs.")]]
HybridContext final {
public:
  std::weak_ptr<HybridObject> cppPart;

public:
  template <typename THybridObject, typename TSwiftPart>
  static inline std::shared_ptr<THybridObject> getOrCreate(TSwiftPart swiftPart) noexcept {
    auto hybridContext = swiftPart.getHybridContext();
    auto hybridObject = std::dynamic_pointer_cast<THybridObject>(hybridContext.cppPart.lock());
    if (hybridObject != nullptr) [[likely]] {
      // Fast path - an existing HybridObject is still in cache! (HybridContext)
      return hybridObject;
    }

    // Slow path - we need to create a new HybridObject that wraps our Swift implementation.
    Logger::log(LogLevel::Info, TAG, "Creating new HybridObject<%s> for %s...", TypeInfo::getFriendlyTypename<THybridObject>().c_str(),
                TypeInfo::getFriendlyTypename<TSwiftPart>().c_str());
    hybridObject = std::make_shared<THybridObject>(std::forward<decltype(swiftPart)>(swiftPart));
    hybridContext.cppPart = hybridObject;
    swiftPart.setHybridContext(hybridContext);
    return hybridObject;
  }

private:
  static constexpr auto TAG = "HybridContext";
};

} // namespace margelo::nitro
