//
//  ThreadUtils.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include <sstream>
#include <string>
#include <thread>

namespace margelo::nitro {

class ThreadUtils final {
public:
  ThreadUtils() = delete;

  /**
   * Get the current Thread's name.
   * This is implemented differently on iOS and Android.
   */
  static std::string getThreadName();

  /**
   * Set the current Thread's name.
   * This is implemented differently on iOS and Android.
   */
  static void setThreadName(const std::string& name);

  /**
   * Convert a given Thread's ID to a string.
   */
  static std::string threadIdToString(const std::thread::id& id) {
    std::ostringstream stream;
    stream << id;
    return stream.str();
  }
};

} // namespace margelo::nitro
