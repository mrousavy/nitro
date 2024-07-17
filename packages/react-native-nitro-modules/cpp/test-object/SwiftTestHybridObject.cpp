//
//  SwiftTestHybridObject.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 23.06.24.
//

#include "SwiftTestHybridObject.hpp"

namespace margelo {


SwiftTestHybridObject::SwiftTestHybridObject(NitroModules::SwiftTestHybridObjectSwift swiftPart):
  HybridObject("SwiftTestHybridObject"), _swiftPart(swiftPart) {
    Logger::log("SwiftTestHybridObject", "Created a new SwiftTestHybridObject");
  }

SwiftTestHybridObject::SwiftTestHybridObject(const SwiftTestHybridObject& copy): HybridObject("SwiftTestHybridObject"), _swiftPart(copy._swiftPart) {
  throw std::runtime_error("SwiftTestHybridObject should not be copied!");
}

SwiftTestHybridObject::SwiftTestHybridObject(SwiftTestHybridObject&& moved): HybridObject("SwiftTestHybridObject"), _swiftPart(moved._swiftPart) {
  throw std::runtime_error("SwiftTestHybridObject should not be moved!");
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
