//
//  NitroError.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 04.11.25
//

#pragma once

#include <exception>
#include <jsi/jsi.h>

namespace margelo::nitro {

class NitroError : public std::exception {
public:
  NitroError(std::string typename, std::string message, std::string stacktrace)
      : _typename(std::move(typename)), _message(std::move(message)), _stacktrace(std::move(stacktrace)) {}

public:
  const char* what() const noexcept override {
    return _message.c_str();
  }

  jsi::Error toJS(jsi::Runtime& runtime) const;

private:
  std::string _typename;
  std::string _message;
  std::string _stacktrace;
};

} // namespace margelo::nitro
