//
//  SwiftTestHybridObject.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 23.06.24.
//

#include "SwiftTestHybridObject.hpp"

namespace margelo {

SwiftTestHybridObject::SwiftTestHybridObject(): HybridObject("SwiftTestHybridObject") {
}

int SwiftTestHybridObject::getInt() {
  return 5;
}

void SwiftTestHybridObject::setInt(int value) {
}

void SwiftTestHybridObject::loadHybridMethods() {
  registerHybridGetter("int", &SwiftTestHybridObject::getInt, this);
  registerHybridSetter("int", &SwiftTestHybridObject::setInt, this);
}

}
