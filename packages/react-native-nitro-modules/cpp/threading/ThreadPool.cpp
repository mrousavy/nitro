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

ThreadPool::ThreadPool(const char* name, size_t numThreads) : _isAlive(true), _name(name) {
  Logger::log(TAG, "Creating ThreadPool \"%s\" with %i threads...", name, numThreads);

  for (size_t i = 0; i < numThreads; ++i) {
    std::string threadName = std::string(name) + "-" + std::to_string(i + 1);
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
  }
}

void ThreadPool::run(std::function<void()>&& task) {
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
  Logger::log(TAG, "Destroying ThreadPool \"%s\"...", _name);

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

std::shared_ptr<ThreadPool> ThreadPool::getSharedPool() {
  static std::shared_ptr<ThreadPool> shared;
  if (shared == nullptr) {
    int availableThreads = std::thread::hardware_concurrency();
    auto numThreads = std::min(availableThreads, 3);
    shared = std::make_shared<ThreadPool>("nitro-thread", numThreads);
  }
  return shared;
}

} // namespace margelo::nitro
