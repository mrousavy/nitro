//
//  RuntimeError.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 19.11.24.
//

#pragma once

#include <exception>
#include <string>

namespace margelo::nitro {

static inline std::exception make_exception(const std::string& message) {
  return std::runtime_error(message);
}

static inline std::string get_exception_message(const std::exception& exception) {
  return exception.what();
}

} // namespace margelo::nitro
