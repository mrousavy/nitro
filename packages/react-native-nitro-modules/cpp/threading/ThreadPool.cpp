//
//  ThreadPool.cpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#include "ThreadPool.hpp"
#include "NitroLogger.hpp"
#include "ThreadUtils.hpp"

namespace margelo::nitro {

ThreadPool::ThreadPool(const char* name, size_t initialThreadCount) : _isAlive(true), _name(name) {
  Logger::log(LogLevel::Info, TAG, "Creating ThreadPool \"%s\" with %i initial threads...", name, initialThreadCount);

  for (size_t i = 0; i < initialThreadCount; i++) {
    addThread();
  }
}

void ThreadPool::addThread() {
  std::unique_lock<std::mutex> lock(_queueMutex);
  size_t i = ++_threadCount;
  Logger::log(LogLevel::Info, TAG, "Adding Thread %i to ThreadPool \"%s\"...", i, _name);
  
  std::string threadName = std::string(_name) + "-" + std::to_string(i);
  _workers.emplace_back([this, threadName] {
    // Set the Thread's name
    ThreadUtils::setThreadName(threadName);

    // Start the run-loop
    while (true) {
      std::function<void()> task;
      {
        // Lock on the mutex so only one Worker receives the condition signal at a time
        std::unique_lock<std::mutex> lock(_queueMutex);
        this->_condition.wait(lock, [this] { return !_isAlive || !_tasks.empty(); });
        if (!_isAlive && _tasks.empty()) {
          // ThreadPool is dead - stop run-loop.
          return;
        }
        // Schedule the oldest task
        task = std::move(_tasks.front());
        _tasks.pop();
      }
      // Run it (outside of the mutex so others can run in parallel)
      task();
    }
  });
  _condition.notify_all();
}

void ThreadPool::run(std::function<void()>&& task) {
  // If we have more than one task queued, we might want to spawn a new Thread.
  if (!_tasks.empty()) {
    addThread();
  }
  {
    // lock on the mutex - we want to emplace the task back in the queue
    std::unique_lock<std::mutex> lock(_queueMutex);
    if (!_isAlive) {
      throw std::runtime_error("Cannot queue the given task - the ThreadPool has already been stopped!");
    }
    _tasks.emplace(std::move(task));
  }
  // Notify about a new task - one of the workers will pick it up
  _condition.notify_one();
}

ThreadPool::~ThreadPool() {
  Logger::log(LogLevel::Info, TAG, "Destroying ThreadPool \"%s\"...", _name);

  {
    // Lock and set `_isAlive` to false.
    std::unique_lock<std::mutex> lock(_queueMutex);
    _isAlive = false;
  }
  // Notify all workers - they will stop the work since `_isAlive` is false.
  _condition.notify_all();
  for (std::thread& worker : _workers) {
    // Wait for each worker to exit.
    worker.join();
  }
}

ThreadPool& ThreadPool::shared() {
  static ThreadPool shared("nitro-thread", 3);
  return shared;
}

} // namespace margelo::nitro
