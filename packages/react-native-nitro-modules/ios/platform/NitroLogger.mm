//
//  NitroLogger.mm
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#include "NitroLogger.hpp"
#include <Foundation/Foundation.h>

namespace margelo::nitro {

const char* levelToString(LogLevel level) {
  switch (level) {
  case LogLevel::Debug:
    return "DEBUG";
  case LogLevel::Info:
    return "INFO";
  case LogLevel::Warning:
    return "WARNING";
  case LogLevel::Error:
    return "ERROR";
  default:
    throw std::runtime_error("Invalid LogLevel!");
  }
}

void Logger::nativeLog(LogLevel level, const std::string& message) {
  const char* logLevel = levelToString(level);
  NSLog(@"[%s] %s", logLevel, message.c_str());
}

} // namespace margelo::nitro
