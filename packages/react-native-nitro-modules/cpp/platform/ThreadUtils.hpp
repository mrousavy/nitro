//
//  ThreadUtils.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#include <string>

namespace margelo::nitro {

class ThreadUtils final {
public:
  ThreadUtils() = delete;

  /**
   * Get the current Thread's name.
   * This is implemented differently on iOS and Android.
   */
  static std::string getThreadName();
};

} // namespace margelo::nitro
