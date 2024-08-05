//
//  ThreadPool.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

#include <atomic>
#include <condition_variable>
#include <functional>
#include <memory>
#include <mutex>
#include <queue>
#include <string>
#include <thread>
#include <vector>

namespace margelo::nitro {

class ThreadPool final {
public:
  /**
   * Create a new ThreadPool with the given number of fixed workers/threads.
   */
  explicit ThreadPool(const char* const name, size_t numThreads);
  ~ThreadPool();

  /**
   * Schedules the given task asynchronously on the ThreadPool.
   * It will run once a worker is available.
   */
  void run(std::function<void()>&& task);

public:
  /**
   * Get a static singleton instance - a shared ThreadPool.
   * The shared ThreadPool has 3 threads.
   */
  static std::shared_ptr<ThreadPool> getSharedPool();

private:
  std::vector<std::thread> _workers;
  std::queue<std::function<void()>> _tasks;
  std::mutex _queueMutex;
  std::condition_variable _condition;
  std::atomic<bool> _isAlive;
  const char* _name;
  static constexpr auto TAG = "ThreadPool";
};

} // namespace margelo::nitro
