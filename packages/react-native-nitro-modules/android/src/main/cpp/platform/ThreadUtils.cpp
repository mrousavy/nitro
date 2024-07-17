//
//  ThreadUtils.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#include "ThreadUtils.hpp"
#include <pthread.h>
#include <thread>

namespace margelo::nitro {

std::string ThreadUtils::getThreadName() {
  // Try using pthread APIs
  char name[16];
  if (prctl(PR_GET_NAME, name, 0, 0, 0) == 0) {
      return std::string(name);
  }

  // Fall back to this_thread ID
  std::stringstream stream;
  stream << std::this_thread::get_id();
  std::string threadId = stream.str();
  return "Thread #" + threadId;
}

} // namespace margelo::nitro
