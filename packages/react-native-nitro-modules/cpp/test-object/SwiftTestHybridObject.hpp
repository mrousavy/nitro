//
//  SwiftTestHybridObject.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 23.06.24.
//

#pragma once

#include "HybridObject.hpp"

#if __has_include("NitroModules-Swift.h")
#include "NitroModules-Swift.h"

namespace margelo {

class SwiftTestHybridObject: public HybridObject {
private:
  explicit SwiftTestHybridObject(NitroModules::SwiftTestHybridObjectSwift swiftPart);
  
public:
  static std::shared_ptr<SwiftTestHybridObject> getHybridPart(NitroModules::SwiftTestHybridObjectSwift swiftPart);
  
public:
  
  int getInt();
  void setInt(int value);
  
  void loadHybridMethods() override;
  
private:
  NitroModules::SwiftTestHybridObjectSwift _swiftPart;
};

}

#endif
