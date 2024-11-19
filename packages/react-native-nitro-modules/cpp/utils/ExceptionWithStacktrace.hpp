//
//  ExceptionWithStacktrace.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 19.11.24.
//

#pragma once

#include <exception>
#include <string>

namespace margelo::nitro {

/**
 * Represents an exception that also contains a stacktrace.
 */
class ExceptionWithStacktrace: public std::exception {
public:
  explicit ExceptionWithStacktrace(std::string message, std::string stacktrace):
    std::exception(), _message(std::move(message)), _stacktrace(std::move(stacktrace)) {}

public:
  [[nodiscard]]
  const char* what() const noexcept override {
    return _message.c_str();
  }

[[nodiscard]]
inline const std::string& getMessage() const noexcept {
    return _message;
}

[[nodiscard]]
inline const std::string& getStacktrace() const noexcept {
    return _stacktrace;
}

private:
  std::string _message;
  std::string _stacktrace;
};

} // namespace margelo::nitro
