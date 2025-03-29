//
//  ThreadUtils.mm
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#include "ThreadUtils.hpp"
#include <pthread.h>
#include <sstream>
#include <thread>

// ObjC import
#import <Foundation/Foundation.h>

namespace margelo::nitro {

std::string ThreadUtils::getThreadName() {
  // Try using NSThread APIs
  NSString* threadName = NSThread.currentThread.name;
  if (threadName != nil && threadName.length > 0) {
    return threadName.UTF8String;
  }

  // Try using DispatchQueue APIs as fallback
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
  dispatch_queue_t queue = dispatch_get_current_queue();
#pragma clang diagnostic pop
  const char* label = dispatch_queue_get_label(queue);
  if (label != nullptr) {
    return label;
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
