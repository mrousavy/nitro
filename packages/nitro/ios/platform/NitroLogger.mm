//
//  NitroLogger.mm
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#include "NitroLogger.hpp"
#include "NitroDefines.hpp"
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
      throw std::invalid_argument("Invalid LogLevel!");
  }
}

void Logger::nativeLog(LogLevel level, const char* tag, const std::string& message) {
#ifdef NITRO_DEBUG
  const char* logLevel = levelToString(level);
  NSLog(@"[%s] [Nitro.%s] %s", logLevel, tag, message.c_str());
#endif
}

} // namespace margelo::nitro
