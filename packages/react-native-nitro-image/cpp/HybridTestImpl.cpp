//
//  HybridTestImpl.cpp
//  NitroImage
//
//  Created by Marc Rousavy on 30.07.24.
//

#include "HybridTestImpl.hpp"
#include <NitroModules/AnyMap.hpp>
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

std::variant<std::string, double>
HybridTestObjectImpl::passVariant(const std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>>& either) {
  return {55.0};
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
  result->setObject("object", {{"string", "hello"}, {"double", 55.0}, {"bool", false}});
  result->setArray("some-array", {55.0, "string", false});
  return result;
}

std::tuple<double, double, double> HybridTestObjectImpl::flip(const std::tuple<double, double, double>& vector) {
  return {std::get<2>(vector), std::get<1>(vector), std::get<0>(vector)};
}

std::tuple<double, std::string, bool> HybridTestObjectImpl::passTuple(const std::tuple<double, std::string, bool>& tuple) {
  return tuple;
}

double HybridTestObjectImpl::getValueThatWillThrowOnAccess() {
  throw std::runtime_error("The stars are not aligned for this to work right now!");
}

void HybridTestObjectImpl::setValueThatWillThrowOnAccess(double valueThatWillThrowOnAccess) {
  throw std::runtime_error("This value can only be set in 100000 years!");
}

double HybridTestObjectImpl::funcThatThrows() {
  throw std::runtime_error("This function will only work after sacrificing seven lambs!");
}

} // namespace margelo::nitro::image
