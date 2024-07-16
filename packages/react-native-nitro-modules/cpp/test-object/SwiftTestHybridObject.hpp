//
//  SwiftTestHybridObject.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 23.06.24.
//

#pragma once

#include "HybridObject.hpp"

namespace margelo {

class SwiftTestHybridObject: public HybridObject {
public:
  explicit SwiftTestHybridObject();
  
  int getInt();
  void setInt(int value);
  
  void loadHybridMethods() override;
};

}
