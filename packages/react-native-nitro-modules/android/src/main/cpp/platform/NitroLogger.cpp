//
//  NitroLogger.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#include "NitroLogger.hpp"
#include <android/log.h>

namespace margelo::nitro {

int levelToAndroidLevel(LogLevel level) {
  switch (level) {
  case LogLevel::Debug:
    return ANDROID_LOG_DEBUG;
  case LogLevel::Info:
    return ANDROID_LOG_INFO;
  case LogLevel::Warning:
    return ANDROID_LOG_WARN;
  case LogLevel::Error:
    return ANDROID_LOG_ERROR;
  default:
    throw std::runtime_error("Invalid LogLevel!");
  }
}

void Logger::nativeLog(LogLevel level, const std::string& message) {
  int logLevel = levelToAndroidLevel(level);
  __android_log_print(logLevel, "Nitro", "%s", message.c_str());
}

} // namespace margelo::nitro
