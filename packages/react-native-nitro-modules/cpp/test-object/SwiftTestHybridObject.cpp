//
//  SwiftTestHybridObject.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 23.06.24.
//

#include "SwiftTestHybridObject.hpp"
#include "NitroLogger.hpp"
#include "HybridContext.hpp"

namespace margelo {

std::shared_ptr<SwiftTestHybridObject> SwiftTestHybridObject::getHybridPart(NitroModules::SwiftTestHybridObjectSwift swiftPart) {
  {
    // 1. Check if we have a C++ context already created and stored in Swift
    HybridContext hybridContext = swiftPart.getHybridContext();
    // 1.1. Get Weak reference to the C++ HybridObject
    std::shared_ptr<HybridObject> hybridObject = hybridContext.cppPart.lock();
    if (hybridObject != nullptr) {
      // 1.2. If we can lock the weak reference to a strong one, we know it's still valid. Let's return that to JS!
      return std::static_pointer_cast<SwiftTestHybridObject>(hybridObject);
    } else {
      // The weak reference cannot be locked - it means JS has garbage collected it, but our native object is still valid. Log this info.
      Logger::log("getHybridPart", "SwiftTestHybridObjectSwift's C++ hybrid context was invalidated by JS/GC - recreating it...");
    }
  }
  
  // 2. If we don't have a valid C++ context anymore, let's create a new one.
  auto hybridObject = std::shared_ptr<SwiftTestHybridObject>(new SwiftTestHybridObject(swiftPart));
  // 3. Wrap the HybridObject in a HybridContext (weak_ptr)
  HybridContext context {
    .cppPart = std::weak_ptr<SwiftTestHybridObject>(hybridObject)
  };
  // 4. Pass the HybridContext to the Swift instance (we cache it here for the next call to go into branch 1.)
  swiftPart.setHybridContext(context);
  // 5. Return the newly created C++ context to JS
  return hybridObject;
}

SwiftTestHybridObject::SwiftTestHybridObject(NitroModules::SwiftTestHybridObjectSwift swiftPart):
  HybridObject("SwiftTestHybridObject"), _swiftPart(swiftPart) {
  Logger::log("SwiftTestHybridObject", "Created a new SwiftTestHybridObject (C++)!");
}

int SwiftTestHybridObject::getInt() {
  return _swiftPart.getInt();
}

void SwiftTestHybridObject::setInt(int value) {
  _swiftPart.setInt(value);
}

void SwiftTestHybridObject::loadHybridMethods() {
  registerHybridGetter("int", &SwiftTestHybridObject::getInt, this);
  registerHybridSetter("int", &SwiftTestHybridObject::setInt, this);
}

}
