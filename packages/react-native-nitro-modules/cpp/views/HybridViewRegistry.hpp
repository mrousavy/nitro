//
//  HybridViewRegistry.hpp
//  Nitro
//
//  Created by Marc Rousavy on 04.02.26.
//

#include "NitroDefines.hpp"
#include <vector>
#include <string>
#include <unordered_map>

namespace margelo::nitro {

struct HybridViewInfo {
  std::vector<std::string> propNames;
};

class HybridViewRegistry final {
public:
  static void registerHybridView(const std::string& viewName, HybridViewInfo&& viewInfo);
  static const HybridViewInfo& getHybridViewInfo(const std::string& viewName);
  
private:
  static std::unordered_map<std::string, HybridViewInfo> _views;
};

}
