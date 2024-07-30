//
//  HybridTestImpl.cpp
//  NitroImage
//
//  Created by Marc Rousavy on 30.07.24.
//

#include "HybridTestImpl.hpp"
#include <NitroModules/NitroLogger.hpp>
#include <thread>

namespace margelo::nitro::image {

  std::future<void> HybridTestObjectImpl::getValueFromJsCallback(const Func_std__future_std__string_& callback,
                                                                 const Func_void_std__string& andThenCall) {
    Logger::log(TAG, "Starting async getValueFromJsCallback(..)..");
    return std::async(std::launch::async, [callback = std::move(callback), andThenCall = std::move(andThenCall)]() {
      Logger::log(TAG, "Getting value from JS...");
      std::future<std::string> jsStringFuture = callback();
      jsStringFuture.wait();
      std::string jsString = jsStringFuture.get();
      Logger::log(TAG, "JS string: %s -> calling back to JS again...", jsString);
      andThenCall(jsString);
      Logger::log(TAG, "Called back to JS! 👍", jsString);
    });
  }

}
