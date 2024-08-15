//
//  Promise.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 11.08.24.
//

#pragma once

#include <future>
#include <memory>
#include <string>

namespace margelo::nitro {

class Promise {
public:
  void reject(const std::string& message) {
    std::runtime_error exception(message);
    std::exception_ptr exceptionPtr = std::make_exception_ptr(exception);
    _promise->set_exception(exceptionPtr);
  }

  void resolve(int result) {
    _promise->set_value(result);
  }
  
  std::future<int> getFuture() const {
    return _promise->get_future();
  }

private:
  explicit Promise() {
    _promise = std::make_shared<std::promise<int>>();
  }
  
private:
  std::shared_ptr<std::promise<int>> _promise;

public:
  static Promise run(void (*run)(const Promise& promise)) {
    Promise promise;
    run(promise);
    return promise;
  }
};

} // namespace margelo::nitro
