//
// Created by Marc Rousavy on 05.03.24.
//

#pragma once

#include <cstdarg>
#include <cstdio>
#include <iostream>
#include <string>
#include <sstream>
#include <type_traits>

namespace margelo::nitro {

enum class LogLevel {
  Debug,
  Info,
  Warning,
  Error
};

class Logger final {
private:
  Logger() = delete;

public:
  template<typename... Args>
  static void log(LogLevel level, const char* tag, const char* format, Args... args) {
#ifndef NDEBUG
  // 0. Make sure args can be passed to sprintf(..)
  static_assert(all_are_trivially_copyable<Args...>(), "All arguments passed to Logger::log(..) must be trivially copyable! "
                                                       "Did you try to pass a complex type, like std::string?");

  // 1. Format all arguments in the message
  std::string message = formatString(format, std::forward<Args>(args)...);

  // 2. Combine it all into a single log message
  std::ostringstream stream;
  stream << "[Nitro." << tag << "] " << message;

  // 3. Call the platform specific log function
  nativeLog(level, stream.str());
#endif
  }

  static void nativeLog(LogLevel level, const std::string& string);

private:

  template<typename... Args>
  static std::string formatString(const char* format, Args&&... args) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wformat-security"
      int size = snprintf(nullptr, 0, format, std::forward<Args>(args)...) + 1; // Extra space for '\0'
      if (size <= 0) { return "Error during formatting."; }
      std::unique_ptr<char[]> buf(new char[size]);
      snprintf(buf.get(), size, format, std::forward<Args>(args)...);
      return std::string(buf.get(), buf.get() + size - 1); // We don't want the '\0' inside
#pragma clang diagnostic pop
  }


  // Overloaded functions to convert std::string to C-style string
  template<typename T>
  static constexpr bool is_trivially_copyable() {
      return std::is_trivially_copyable<T>::value;
  }

  template<typename... Args>
  static constexpr bool all_are_trivially_copyable() {
      return (is_trivially_copyable<Args>() && ...);
  }
};

} // namespace margelo::nitro