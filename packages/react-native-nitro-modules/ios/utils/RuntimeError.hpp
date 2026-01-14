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

std::exception_ptr makeException(const std::string& message, const std::string& stacktrace);
std::string getExceptionMessage(const std::exception_ptr& exception);
std::string getExceptionStacktrace(const std::exception_ptr& exception);

} // namespace margelo::nitro
