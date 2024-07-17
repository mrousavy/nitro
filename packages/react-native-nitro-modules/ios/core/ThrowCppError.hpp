//
//  ThrowCppError.hpp
//  Pods
//
//  Created by Marc Rousavy on 17.07.24.
//

#pragma once

#include <string>
#include <stdexcept>

namespace margelo {

void throwCppError(std::string message) {
  throw std::runtime_error(message);
}

} // namespace margelo
