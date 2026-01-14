//
//  RuntimeError.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 14.01.26.
//

#include "RuntimeError.hpp"
#include "NitroTypeInfo.hpp"
#include <NitroModules/Error.hpp>
#include <exception>
#include <string>

namespace margelo::nitro {

std::exception_ptr makeException(const std::string& message, const std::string& stacktrace) {
  return std::make_exception_ptr(nitro::Error(message, stacktrace));
}

std::string getExceptionMessage(const std::exception_ptr& exception) {
  if (exception == nullptr) [[unlikely]] {
    throw std::runtime_error("Cannot get error message of a nullptr exception_ptr!");
  }

  try {
    std::rethrow_exception(exception);
  } catch (const std::exception& error) {
    return error.what();
  } catch (...) {
    std::string errorName = TypeInfo::getCurrentExceptionName();
    return "Unknown " + errorName + " exception";
  }
}

std::string getExceptionStacktrace(const std::exception_ptr& exception) {
  if (exception == nullptr) [[unlikely]] {
    throw std::runtime_error("Cannot get error message of a nullptr exception_ptr!");
  }

  try {
    std::rethrow_exception(exception);
  } catch (const nitro::Error& error) {
    return error.stacktrace();
  } catch (...) {
    return "";
  }
}

} // namespace margelo::nitro
