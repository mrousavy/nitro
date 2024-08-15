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

template <typename TResult>
class Promise {
public:
  void reject(const std::string& message) {
    std::runtime_error exception(message);
    std::exception_ptr exceptionPtr = std::make_exception_ptr(exception);
    _promise->set_exception(exceptionPtr);
  }

  void resolve(const TResult& result) {
    _promise->set_value(result);
  }
  
  std::future<TResult> getFuture() const {
    return _promise->get_future();
  }

private:
  explicit Promise() {
    _promise = std::make_shared<std::promise<TResult>>();
  }
  
private:
  std::shared_ptr<std::promise<TResult>> _promise;

public:
  static Promise<TResult> run(void (*run)(const Promise<TResult>& promise)) {
    Promise<TResult> promise;
    run(promise);
    return promise;
  }
};

} // namespace margelo::nitro
