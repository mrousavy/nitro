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
   * Converts the given `std::thread::id` to a string.
   */
  static std::string idToString(const std::thread::id& id) {
    std::stringstream stream;
    stream << id;
    std::string threadId = stream.str();
    return "#" + threadId;
  }

  /**
   * Set the current Thread's name.
   * This is implemented differently on iOS and Android.
   */
  static void setThreadName(const std::string& name);
};

} // namespace margelo::nitro
