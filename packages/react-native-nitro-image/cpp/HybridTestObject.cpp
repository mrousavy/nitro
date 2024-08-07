//
//  HybridTestObject.cpp
//  NitroImage
//
//  Created by Marc Rousavy on 30.07.24.
//

#include "HybridTestObject.hpp"
#include <NitroModules/AnyMap.hpp>
#include <NitroModules/NitroLogger.hpp>
#include <chrono>
#include <thread>

namespace margelo::nitro::image {

// Properties
double HybridTestObject::getNumberValue() {
  return _number;
}

void HybridTestObject::setNumberValue(double numberValue) {
  _number = numberValue;
}

bool HybridTestObject::getBoolValue() {
  return _bool;
}

void HybridTestObject::setBoolValue(bool boolValue) {
  _bool = boolValue;
}

std::string HybridTestObject::getStringValue() {
  return _string;
}

void HybridTestObject::setStringValue(const std::string& stringValue) {
  _string = stringValue;
}

int64_t HybridTestObject::getBigintValue() {
  return _bigint;
}

void HybridTestObject::setBigintValue(int64_t bigintValue) {
  _bigint = bigintValue;
}

std::optional<std::string> HybridTestObject::getStringOrUndefined() {
  return _optionalString;
}

void HybridTestObject::setStringOrUndefined(const std::optional<std::string>& stringOrUndefined) {
  _optionalString = stringOrUndefined;
}

std::optional<std::string> HybridTestObject::getStringOrNull() {
  return _optionalString;
}

void HybridTestObject::setStringOrNull(const std::optional<std::string>& stringOrNull) {
  _optionalString = stringOrNull;
}

std::optional<std::string> HybridTestObject::getOptionalString() {
  return _optionalString;
}

void HybridTestObject::setOptionalString(const std::optional<std::string>& optionalString) {
  _optionalString = optionalString;
}

double HybridTestObject::getValueThatWillThrowOnAccess() {
  throw std::runtime_error("The stars are not aligned for this to work right now!");
}

void HybridTestObject::setValueThatWillThrowOnAccess(double valueThatWillThrowOnAccess) {
  throw std::runtime_error("This value can only be set in 100000 years!");
}

std::variant<std::string, double> HybridTestObject::getSomeVariant() {
  return _variant;
}

void HybridTestObject::setSomeVariant(const std::variant<std::string, double>& variant) {
  _variant = variant;
}

std::tuple<double, std::string> HybridTestObject::getSomeTuple() {
  return _tuple;
}

void HybridTestObject::setSomeTuple(const std::tuple<double, std::string>& tuple) {
  _tuple = tuple;
}

std::shared_ptr<HybridTestObjectSpec> HybridTestObject::getSelf() {
  return shared<HybridTestObject>();
}

// Methods
void HybridTestObject::simpleFunc() {
  // do nothing
}

void HybridTestObject::multipleArguments(double num, const std::string& str, bool boo) {
  Logger::log(TAG, "Arguments received! num: %d | str: %s | boo: %i", num, str, boo);
}

std::shared_ptr<AnyMap> HybridTestObject::createMap() {
  auto map = AnyMap::make();
  map->setDouble("number", getNumberValue());
  map->setBoolean("bool", getBoolValue());
  map->setString("string", getStringValue());
  map->setBigInt("bigint", getBigintValue());
  map->setNull("null");
  std::vector<AnyValue> array{getNumberValue(), getBoolValue(), getStringValue(), getBigintValue()};
  map->setArray("array", {getNumberValue(), getBoolValue(), getStringValue(), getBigintValue(), array});
  map->setObject("object", {{"number", getNumberValue()},
                            {"bool", getBoolValue()},
                            {"string", getStringValue()},
                            {"bigint", getBigintValue()},
                            {"null", std::monostate()},
                            {"array", array}});
  return map;
}

std::shared_ptr<AnyMap> HybridTestObject::mapRoundtrip(const std::shared_ptr<AnyMap>& map) {
  return map;
}

double HybridTestObject::funcThatThrows() {
  throw std::runtime_error("This function will only work after sacrificing seven lambs!");
}

std::string HybridTestObject::tryOptionalParams(double num, bool boo, const std::optional<std::string>& str) {
  if (str.has_value()) {
    return str.value();
  } else {
    return "value omitted!";
  }
}

std::string HybridTestObject::tryMiddleParam(double num, std::optional<bool> boo, const std::string& str) {
  return str;
}

std::variant<std::string, double>
HybridTestObject::passVariant(const std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>>& either) {
  if (std::holds_alternative<std::string>(either)) {
    return std::get<std::string>(either);
  } else if (std::holds_alternative<double>(either)) {
    return std::get<double>(either);
  } else {
    return {"holds something else!"};
  }
}

std::variant<bool, OldEnum> HybridTestObject::getVariantEnum(const std::variant<bool, OldEnum>& variant) {
  return variant;
}

std::variant<Person, Car> HybridTestObject::getVariantObjects(const std::variant<Person, Car>& variant) {
  return variant;
}

std::variant<std::shared_ptr<margelo::nitro::image::HybridTestObjectSpec>, Person>
HybridTestObject::getVariantHybrid(const std::variant<std::shared_ptr<margelo::nitro::image::HybridTestObjectSpec>, Person>& variant) {
  return variant;
}

std::variant<std::vector<double>, std::tuple<double, std::string, bool>, std::tuple<double, double, double>>
HybridTestObject::getVariantTuple(
    const std::variant<std::vector<double>, std::tuple<double, std::string, bool>, std::tuple<double, double, double>>& variant) {
  return variant;
}

std::tuple<double, double, double> HybridTestObject::flip(const std::tuple<double, double, double>& tuple) {
  return {std::get<2>(tuple), std::get<1>(tuple), std::get<0>(tuple)};
}

std::tuple<double, std::string, bool> HybridTestObject::passTuple(const std::tuple<double, std::string, bool>& tuple) {
  return tuple;
}

int64_t HybridTestObject::calculateFibonacciSync(double value) {
  return calculateFibonacci(value);
}

std::future<int64_t> HybridTestObject::calculateFibonacciAsync(double value) {
  return std::async(std::launch::async, [=]() -> int64_t { return this->calculateFibonacci(value); });
}

std::future<void> HybridTestObject::wait(double seconds) {
  return std::async(std::launch::async, [=]() {
    std::chrono::nanoseconds nanoseconds(static_cast<int64_t>(seconds * 1'000'000'000));
    std::this_thread::sleep_for(nanoseconds);
  });
}

void HybridTestObject::callCallback(const Func_void& callback) {
  callback();
}

void HybridTestObject::getValueFromJSCallback(const Func_std__future_double_& getValue) {
  ThreadPool::getSharedPool()->run([=]() {
    std::future<double> future = getValue();
    future.wait();
  });
}

std::future<double> HybridTestObject::getValueFromJSCallbackAndWait(const Func_std__future_double_& getValue) {
  return std::async(std::launch::async, [=]() -> double {
    std::future<double> future = getValue();
    future.wait();
    double value = future.get();
    return value;
  });
}

void HybridTestObject::callAll(const Func_void& first, const Func_void& second, const Func_void& third) {
  first();
  second();
  third();
}

std::future<void> HybridTestObject::getValueFromJsCallback(const Func_std__future_std__string_& callback,
                                                           const Func_void_std__string& andThenCall) {
  return std::async(std::launch::async, [=]() {
    std::future<std::string> future = callback();
    std::string jsValue = future.get();
    andThenCall(jsValue);
  });
}

Car HybridTestObject::getCar() {
  return Car(2018, "Lamborghini", "Huracan Performante", 640, Powertrain::GAS, std::nullopt);
}

bool HybridTestObject::isCarElectric(const Car& car) {
  return car.powertrain == Powertrain::ELECTRIC;
}

std::optional<Person> HybridTestObject::getDriver(const Car& car) {
  if (car.driver.has_value()) {
    return car.driver.value();
  } else {
    return std::nullopt;
  }
}

std::shared_ptr<ArrayBuffer> HybridTestObject::createArrayBuffer() {
  size_t size = 1024 * 1024 * 10; // 10MB
  uint8_t* buffer = new uint8_t[size];
  return std::make_shared<NativeArrayBuffer>(buffer, size, true);
}

double HybridTestObject::getBufferLastItem(const std::shared_ptr<ArrayBuffer>& buffer) {
  size_t size = buffer->size();
  if (size == 0) {
    throw std::runtime_error("ArrayBuffer's size is 0!");
  }
  uint8_t* data = buffer->data();
  if (data == nullptr) {
    throw std::runtime_error("ArrayBuffer's data is nullptr!");
  }
  uint8_t lastItem = data[size - 1];
  return static_cast<double>(lastItem);
}

void HybridTestObject::setAllValuesTo(const std::shared_ptr<ArrayBuffer>& buffer, double value) {
  size_t size = buffer->size();
  if (size == 0) {
    throw std::runtime_error("ArrayBuffer's size is 0!");
  }
  uint8_t* data = buffer->data();
  if (data == nullptr) {
    throw std::runtime_error("ArrayBuffer's data is nullptr!");
  }

  for (size_t i = 0; i < size; i++) {
    data[i] = static_cast<uint8_t>(value);
  }
}

std::shared_ptr<HybridTestObjectSpec> HybridTestObject::newTestObject() {
  return std::make_shared<HybridTestObject>();
}

} // namespace margelo::nitro::image
