//
//  RuntimeError.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 19.11.24.
//

#include <exception>
#include <string>

namespace margelo::nitro {

std::exception make_exception(const std::string& message) {
  return std::runtime_error(message);
}

} // namespace margelo::nitro
