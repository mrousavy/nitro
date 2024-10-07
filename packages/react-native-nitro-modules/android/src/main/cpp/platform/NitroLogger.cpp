//
//  NitroLogger.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#include "NitroLogger.hpp"
#include "NitroDefines.hpp"
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
      throw std::invalid_argument("Invalid LogLevel!");
  }
}

void Logger::nativeLog(LogLevel level, const char* tag, const std::string& message) {
#ifdef NITRO_DEBUG
  int logLevel = levelToAndroidLevel(level);
  std::string combinedTag = "Nitro." + std::string(tag);
  __android_log_print(logLevel, combinedTag.c_str(), "%s", message.c_str());
#endif
}

} // namespace margelo::nitro
