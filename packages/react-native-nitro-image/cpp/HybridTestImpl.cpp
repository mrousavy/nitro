//
//  HybridTestImpl.cpp
//  NitroImage
//
//  Created by Marc Rousavy on 30.07.24.
//

#include "HybridTestImpl.hpp"
#include <NitroModules/NitroLogger.hpp>
#include <NitroModules/AnyMap.hpp>
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

  std::variant<std::string, double> HybridTestObjectImpl::getVariant() {
      return std::variant<std::string, double>(13.7);
  }
    std::shared_ptr<AnyMap> HybridTestObjectImpl::mapRoundtrip(const std::shared_ptr<AnyMap>& map) {
      return map;
    }

    std::shared_ptr<AnyMap> HybridTestObjectImpl::createMap() {
        auto result = std::make_shared<AnyMap>();
        result->setNull("null");
        result->setDouble("double", 55.5);
        result->setBoolean("bool", true);
        result->setBigInt("bigint", 225452346346);
        result->setString("string", "Hello!");
        result->setObject("object", { {"string", "hello"}, { "double", 55.0 }, { "bool", false } });
        result->setArray("some-array", { 55.0, "string", false });
        return result;
  }
}
