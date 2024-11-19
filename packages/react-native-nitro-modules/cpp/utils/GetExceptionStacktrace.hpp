//
//  GetExceptionStacktrace.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 19.11.24.
//

#pragma once

#include <exception>
#include <string>
#include <execinfo.h>
#include <sstream>
#include <cxxabi.h>
#include <cstdlib>
#include "ExceptionWithStacktrace.hpp"

namespace margelo::nitro {

/**
 * Get the stacktrace of an `std::exception`.
 */
std::string getExceptionStacktrace(const std::exception& exception) {
  if (dynamic_cast<const ExceptionWithStacktrace*>(&exception)) {
    // It has a stacktrace! Maybe a Java exception.
    auto exceptionWithStacktrace = dynamic_cast<const ExceptionWithStacktrace*>(&exception);
    return exceptionWithStacktrace->getStacktrace();
  }

  // It doesn't have a stacktrace. Use backtrace() to figure out a stacktrace..
  const int maxFrames = 100;
  void* callstack[maxFrames];
  int frames = backtrace(callstack, maxFrames);
  char** symbols = backtrace_symbols(callstack, frames);

  std::ostringstream oss;
  for (int i = 0; i < frames; ++i) {
      char* demangled = nullptr;
      char* begin = nullptr;
      char* end = nullptr;

      // Try to demangle the function name
      for (char* p = symbols[i]; *p; ++p) {
          if (*p == '(') begin = p;
          else if (*p == '+') end = p;
      }

      if (begin && end && begin < end) {
          *end = '\0';
          int status;
          demangled = abi::__cxa_demangle(begin + 1, nullptr, nullptr, &status);
      }

      oss << (demangled ? demangled : symbols[i]) << "\n";
      free(demangled);
  }
  free(symbols);
  return oss.str();
}

} // namespace margelo::nitro
