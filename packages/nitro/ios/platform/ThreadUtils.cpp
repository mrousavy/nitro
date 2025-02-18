//
//  ThreadUtils.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#include "ThreadUtils.hpp"
#include <pthread.h>
#include <sstream>
#include <thread>

namespace margelo::nitro {

std::string ThreadUtils::getThreadName() {
  // Try using pthread APIs
  char name[256];
  if (pthread_getname_np(pthread_self(), name, sizeof(name)) == 0) {
    return std::string(name);
  }

  // Fall back to this_thread ID
  std::stringstream stream;
  stream << std::this_thread::get_id();
  std::string threadId = stream.str();
  return "Thread #" + threadId;
}

void ThreadUtils::setThreadName(const std::string& name) {
  pthread_setname_np(name.c_str());
}

} // namespace margelo::nitro
