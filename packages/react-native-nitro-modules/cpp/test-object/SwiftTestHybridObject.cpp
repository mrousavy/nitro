//
//  SwiftTestHybridObject.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 23.06.24.
//

#include "SwiftTestHybridObject.hpp"

namespace margelo {

SwiftTestHybridObject::SwiftTestHybridObject(NitroModules::SwiftTestHybridObjectSwift swiftPart):
  HybridObject("SwiftTestHybridObject"), _swiftPart(swiftPart) { }

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
