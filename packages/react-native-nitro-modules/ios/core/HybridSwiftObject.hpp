//
//  HybridSwiftObject.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 17.07.24.
//

#pragma once

#include "HybridObject.hpp"
#include "HybridContext.hpp"

namespace margelo {

class HybridSwiftObject {
private:
  static constexpr auto TAG = "HybridSwiftObject";
  
public:
  template<typename TCppHybrid, typename TSwiftImpl>
  static std::shared_ptr<TCppHybrid> getHybridPart(TSwiftImpl swiftPart) {
    {
      // 1. Check if we have a C++ context already created and stored in Swift
      HybridContext hybridContext = swiftPart.getHybridContext();
      // 1.1. Get Weak reference to the C++ HybridObject
      std::shared_ptr<HybridObject> hybridObject = hybridContext.cppPart.lock();
      if (hybridObject != nullptr) {
        // 1.2. If we can lock the weak reference to a strong one, we know it's still valid. Let's return that to JS!
        return std::static_pointer_cast<TCppHybrid>(hybridObject);
      } else {
        // The weak reference cannot be locked - it means JS has garbage collected it, but our native object is still valid. Log this info.
        Logger::log(TAG, "SwiftTestHybridObjectSwift's C++ hybrid context was invalidated by JS/GC - recreating it...");
      }
    }
    
    // 2. If we don't have a valid C++ context anymore, let's create a new one.
    auto hybridObject = std::shared_ptr<TCppHybrid>(new TCppHybrid(swiftPart));
    // 3. Wrap the HybridObject in a HybridContext (weak_ptr)
    HybridContext context {
      .cppPart = std::weak_ptr<TCppHybrid>(hybridObject)
    };
    // 4. Pass the HybridContext to the Swift instance (we cache it here for the next call to go into branch 1.)
    swiftPart.setHybridContext(context);
    // 5. Return the newly created C++ context to JS
    return hybridObject;
  }
};

} // namespace margelo
