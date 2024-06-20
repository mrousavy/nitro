#include "react-native-nitro.hpp"

namespace nitro {

std::shared_ptr<margelo::TestHybridObject> createTestHybridObject() {
  return std::make_shared<margelo::TestHybridObject>();
}

}
