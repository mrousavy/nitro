//
// Created by Marc Rousavy on 05.03.24.
//

#pragma once

#include <iostream>
#include <string>
#include <format>

namespace margelo {

class Logger {
private:
  Logger() = delete;

public:
  template <typename... Args> inline static void log(const std::string& tag, const std::string& message, Args&&... args) {
    try {
      std::string formattedMessage = std::format(message, std::forward<decltype(args)>(args)...);
      std::cout << "[" << tag << "] " << formattedMessage << std::endl;
    } catch (const std::format_error& e) {
      std::cerr << "Formatting error: " << e.what() << std::endl;
    }
  }
};

} // namespace margelo
