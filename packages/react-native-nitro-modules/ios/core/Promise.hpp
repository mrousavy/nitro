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
  Promise(const Promise&) = delete;
  Promise(Promise&&) = delete;
  
public:
  void reject(const std::string& message) {
    // TODO: reject()
  }
  
  void resolve(int result) {
    // TODO: resolve()
  }
  
private:
  explicit Promise() {
    // TODO: Init? From Future?
  }
  
public:
  static std::shared_ptr<Promise> run(void(*run)(std::shared_ptr<Promise> promise)) {
    auto promise = std::shared_ptr<Promise>(new Promise());
    run(promise);
    return promise;
  }
};

} // namespace margelo::nitro
