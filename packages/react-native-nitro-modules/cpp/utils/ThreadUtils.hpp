//
//  ThreadUtils.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 21.10.24.
//

#pragma once

#include <thread>

namespace margelo::nitro {

class ThreadUtils final {
public:
  static std::string threadIdToString(const std::thread::id& id) {
    std::ostringstream stream;
    stream << id;
    return stream.str();
  }
};

} // namespace margelo::nitro
