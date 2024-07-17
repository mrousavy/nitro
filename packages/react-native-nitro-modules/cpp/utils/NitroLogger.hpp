//
// Created by Marc Rousavy on 05.03.24.
//

#pragma once

#include <iostream>
#include <string>
#include <cstdio>
#include <cstdarg>
#include <vector>

namespace margelo::nitro {

class Logger {
private:
  Logger() = delete;

public:
  template <typename... Args>
  static void log(const char* tag, const char* message, Args&&... args) {
    std::string formattedMessage = format(message, std::forward<Args>(args)...);
    std::cout << "[Nitro." << tag << "] " << formattedMessage << std::endl;
  }

private:
  template <typename... Args>
  static inline std::string format(const char* formatString, Args&&... args) {
    int size_s = std::snprintf(nullptr, 0, formatString, toCString(args)...) + 1; // Extra space for '\0'
    if (size_s <= 0) [[unlikely]] {
        throw std::runtime_error("Failed to format log message \"" + std::string(formatString) + "\"!");
    }
    auto size = static_cast<size_t>(size_s);
    std::vector<char> buf(size);
    std::snprintf(buf.data(), size, formatString, toCString(args)...);
    return std::string(buf.data(), buf.data() + size - 1); // We don't want the '\0' inside
  }

private:
  // When the user passes an `std::string`, it will automatically be converted to a `const char*`
  static inline const char* toCString(const std::string& s) {
      return s.c_str();
  }
  // When the user passes a `const char*`, we don't want to implicitly convert to `std::string`, so block that
  static inline const char* toCString(const char* s) {
      return s;
  }
  // When the user passes any other type, just return that directly.
  template <typename T>
  static inline T toCString(T value) {
      return value;
  }
};

} // namespace margelo::nitro
