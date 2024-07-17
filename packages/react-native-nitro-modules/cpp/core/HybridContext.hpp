//
//  HybridContext.hpp
//  Pods
//
//  Created by Marc Rousavy on 17.07.24.
//

#pragma once

#include <memory>

namespace margelo::nitro {

class HybridObject;

/**
 * Represents contextual state for a `HybridObject`.
 *
 * This can be used in remote implementations, e.g. in a Swift implementation
 * to properly (weak-)reference the `HybridObject` instead of re-creating it each time.
 */
struct HybridContext {
  std::weak_ptr<HybridObject> cppPart;
};

} // namespace margelo::nitro
