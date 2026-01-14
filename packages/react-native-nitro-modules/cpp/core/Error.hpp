//
//  Error.hpp
//  Nitro
//
//  Created by Marc Rousavy on 14.01.26.
//

#pragma once

#include <exception>
#include <string>

namespace margelo::nitro {

struct Error : std::exception {
public:
  /**
   * Create a new `Error` with the given `message` and `stacktrace`.
   */
  Error(const std::string& message, const std::string& stacktrace) : _message(message), _stacktrace(stacktrace) {}
  /**
   * Create a new `Error` with the given `message`,
   * and automatically generate a C++ stacktrace.
   */
  explicit Error(const std::string& message) : _message(message) {
    throw std::runtime_error("Generating a stacktrace is not yet implemented!");
  }

  inline const std::string& stacktrace() const noexcept {
    return _stacktrace;
  }

  const char* what() const noexcept override {
    return _message.c_str();
  }

private:
  std::string _message;
  std::string _stacktrace;
};

} // namespace margelo::nitro
