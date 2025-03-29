//
//  ThreadUtils.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#include "ThreadUtils.hpp"
#include <pthread.h>
#include <sstream>
#include <string>
#include <sys/prctl.h>
#include <thread>

namespace margelo::nitro {

std::string ThreadUtils::getThreadName() {
#ifdef HAVE_ANDROID_PTHREAD_SETNAME_NP
  // Try using pthread APIs
  pthread_t thisThread = pthread_self();
  char threadName[16]; // Thread name length limit in Android is 16 characters

  int result = pthread_getname_np(thisThread, threadName, sizeof(threadName));
  if (result == 0) {
    return std::string(threadName);
  }
#endif

  // Fall back to this_thread ID
  std::stringstream stream;
  stream << std::this_thread::get_id();
  std::string threadId = stream.str();
  return "Thread #" + threadId;
}

void ThreadUtils::setThreadName(const std::string& name) {
  prctl(PR_SET_NAME, name.c_str(), 0, 0, 0);
}

} // namespace margelo::nitro
