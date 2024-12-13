//
//  HybridTestObjectCpp.cpp
//  NitroImage
//
//  Created by Marc Rousavy on 30.07.24.
//

#include "HybridTestObjectCpp.hpp"
#include <NitroModules/AnyMap.hpp>
#include <NitroModules/NitroLogger.hpp>
#include <chrono>
#include <thread>

#include "HybridBase.hpp"
#include "HybridChild.hpp"

namespace margelo::nitro::image {

// Properties
double HybridTestObjectCpp::getNumberValue() {
  return _number;
}

void HybridTestObjectCpp::setNumberValue(double numberValue) {
  _number = numberValue;
}

bool HybridTestObjectCpp::getBoolValue() {
  return _bool;
}

void HybridTestObjectCpp::setBoolValue(bool boolValue) {
  _bool = boolValue;
}

std::string HybridTestObjectCpp::getStringValue() {
  return _string;
}

void HybridTestObjectCpp::setStringValue(const std::string& stringValue) {
  _string = stringValue;
}

int64_t HybridTestObjectCpp::getBigintValue() {
  return _bigint;
}

void HybridTestObjectCpp::setBigintValue(int64_t bigintValue) {
  _bigint = bigintValue;
}

std::optional<std::string> HybridTestObjectCpp::getStringOrUndefined() {
  return _optionalString;
}

void HybridTestObjectCpp::setStringOrUndefined(const std::optional<std::string>& stringOrUndefined) {
  _optionalString = stringOrUndefined;
}

std::optional<std::string> HybridTestObjectCpp::getStringOrNull() {
  return _optionalString;
}

void HybridTestObjectCpp::setStringOrNull(const std::optional<std::string>& stringOrNull) {
  _optionalString = stringOrNull;
}

std::optional<std::string> HybridTestObjectCpp::getOptionalString() {
  return _optionalString;
}

void HybridTestObjectCpp::setOptionalString(const std::optional<std::string>& optionalString) {
  _optionalString = optionalString;
}

std::optional<std::vector<std::string>> HybridTestObjectCpp::getOptionalArray() {
  return _optionalArray;
}

void HybridTestObjectCpp::setOptionalArray(const std::optional<std::vector<std::string>>& optionalArray) {
  _optionalArray = optionalArray;
}

std::optional<std::shared_ptr<HybridTestObjectCppSpec>> HybridTestObjectCpp::getOptionalHybrid() {
  return _optionalHybrid;
}

void HybridTestObjectCpp::setOptionalHybrid(const std::optional<std::shared_ptr<HybridTestObjectCppSpec>>& optionalHybrid) {
  _optionalHybrid = optionalHybrid;
}

std::variant<std::string, double> HybridTestObjectCpp::getSomeVariant() {
  return _variant;
}

void HybridTestObjectCpp::setSomeVariant(const std::variant<std::string, double>& variant) {
  _variant = variant;
}

std::tuple<double, std::string> HybridTestObjectCpp::getSomeTuple() {
  return _tuple;
}

void HybridTestObjectCpp::setSomeTuple(const std::tuple<double, std::string>& tuple) {
  _tuple = tuple;
}

std::shared_ptr<HybridTestObjectCppSpec> HybridTestObjectCpp::getThisObject() {
  return shared<HybridTestObjectCppSpec>();
}

std::optional<Powertrain> HybridTestObjectCpp::getOptionalEnum() {
  return _optionalEnum;
}

void HybridTestObjectCpp::setOptionalEnum(std::optional<Powertrain> optionalEnum) {
  _optionalEnum = optionalEnum;
}

std::optional<OldEnum> HybridTestObjectCpp::getOptionalOldEnum() {
  return _optionalOldEnum;
}

void HybridTestObjectCpp::setOptionalOldEnum(std::optional<OldEnum> optionalOldEnum) {
  _optionalOldEnum = optionalOldEnum;
}

// Methods
double HybridTestObjectCpp::addNumbers(double a, double b) {
  return a + b;
}

std::string HybridTestObjectCpp::addStrings(const std::string& a, const std::string& b) {
  return a + b;
}

void HybridTestObjectCpp::simpleFunc() {
  // do nothing
}

void HybridTestObjectCpp::multipleArguments(double num, const std::string& str, bool boo) {
  Logger::log(LogLevel::Info, TAG, "Arguments received! num: %f | str: %s | boo: %i", num, str.c_str(), boo);
}

std::vector<std::string> HybridTestObjectCpp::bounceStrings(const std::vector<std::string>& array) {
  return array;
}

std::vector<double> HybridTestObjectCpp::bounceNumbers(const std::vector<double>& array) {
  return array;
}

std::vector<Person> HybridTestObjectCpp::bounceStructs(const std::vector<Person>& array) {
  return array;
}

std::vector<Powertrain> HybridTestObjectCpp::bounceEnums(const std::vector<Powertrain>& array) {
  return array;
}

void HybridTestObjectCpp::complexEnumCallback(const std::vector<Powertrain>& array,
                                              const std::function<void(const std::vector<Powertrain>& /* array */)>& callback) {
  callback(array);
}

std::shared_ptr<AnyMap> HybridTestObjectCpp::createMap() {
  auto map = AnyMap::make();
  map->setDouble("number", getNumberValue());
  map->setBoolean("bool", getBoolValue());
  map->setString("string", getStringValue());
  map->setBigInt("bigint", getBigintValue());
  map->setNull("null");
  std::vector<AnyValue> array{getNumberValue(), getBoolValue(), getStringValue(), getBigintValue()};
  map->setArray("array", array);
  std::vector<AnyValue> nestedArray{getNumberValue(), getBoolValue(), getStringValue(), getBigintValue(), array};
  map->setObject("object", {{"number", getNumberValue()},
                            {"bool", getBoolValue()},
                            {"string", getStringValue()},
                            {"bigint", getBigintValue()},
                            {"null", std::monostate()},
                            {"array", nestedArray}});
  return map;
}

std::shared_ptr<AnyMap> HybridTestObjectCpp::mapRoundtrip(const std::shared_ptr<AnyMap>& map) {
  return map;
}

double HybridTestObjectCpp::funcThatThrows() {
  throw std::runtime_error("This function will only work after sacrificing seven lambs!");
}

void HybridTestObjectCpp::throwError(const std::exception_ptr& error) {
  std::rethrow_exception(error);
}

std::string HybridTestObjectCpp::tryOptionalParams(double num, bool boo, const std::optional<std::string>& str) {
  if (str.has_value()) {
    return str.value();
  } else {
    return "value omitted!";
  }
}

std::string HybridTestObjectCpp::tryMiddleParam(double num, std::optional<bool> boo, const std::string& str) {
  return str;
}

std::optional<Powertrain> HybridTestObjectCpp::tryOptionalEnum(std::optional<Powertrain> value) {
  return value;
}

std::variant<std::string, double>
HybridTestObjectCpp::passVariant(const std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>>& either) {
  if (std::holds_alternative<std::string>(either)) {
    return std::get<std::string>(either);
  } else if (std::holds_alternative<double>(either)) {
    return std::get<double>(either);
  } else {
    return {"holds something else!"};
  }
}

std::variant<bool, OldEnum> HybridTestObjectCpp::getVariantEnum(const std::variant<bool, OldEnum>& variant) {
  return variant;
}

std::variant<Car, Person> HybridTestObjectCpp::getVariantObjects(const std::variant<Car, Person>& variant) {
  return variant;
}

std::variant<std::shared_ptr<HybridTestObjectCppSpec>, Person>
HybridTestObjectCpp::getVariantHybrid(const std::variant<std::shared_ptr<HybridTestObjectCppSpec>, Person>& variant) {
  return variant;
}

std::variant<std::tuple<double, double>, std::tuple<double, double, double>>
HybridTestObjectCpp::getVariantTuple(const std::variant<std::tuple<double, double>, std::tuple<double, double, double>>& variant) {
  return variant;
}

std::tuple<double, double, double> HybridTestObjectCpp::flip(const std::tuple<double, double, double>& tuple) {
  return {std::get<2>(tuple), std::get<1>(tuple), std::get<0>(tuple)};
}

std::tuple<double, std::string, bool> HybridTestObjectCpp::passTuple(const std::tuple<double, std::string, bool>& tuple) {
  return tuple;
}

int64_t HybridTestObjectCpp::calculateFibonacciSync(double value) {
  return calculateFibonacci(value);
}

std::shared_ptr<Promise<int64_t>> HybridTestObjectCpp::calculateFibonacciAsync(double value) {
  return Promise<int64_t>::async([this, value]() -> int64_t { return this->calculateFibonacci(value); });
}

std::shared_ptr<Promise<void>> HybridTestObjectCpp::wait(double seconds) {
  return Promise<void>::async([=]() {
    std::chrono::nanoseconds nanoseconds(static_cast<int64_t>(seconds * 1'000'000'000));
    std::this_thread::sleep_for(nanoseconds);
  });
}

void HybridTestObjectCpp::callCallback(const std::function<void()>& callback) {
  callback();
}

void HybridTestObjectCpp::callWithOptional(std::optional<double> value,
                                           const std::function<void(std::optional<double> /* maybe */)>& callback) {
  callback(value);
}

std::shared_ptr<Promise<double>>
HybridTestObjectCpp::getValueFromJSCallbackAndWait(const std::function<std::shared_ptr<Promise<double>>()>& getValue) {
  return Promise<double>::async([=]() -> double {
    std::shared_ptr<Promise<double>> promise = getValue();
    std::future<double> future = promise->await();
    future.wait();
    double value = future.get();
    return value;
  });
}

std::shared_ptr<Promise<double>> HybridTestObjectCpp::awaitAndGetPromise(const std::shared_ptr<Promise<double>>& promise) {
  auto newPromise = Promise<double>::create();
  promise->addOnResolvedListener([=](double result) { newPromise->resolve(result); });
  promise->addOnRejectedListener([=](const std::exception_ptr& error) { newPromise->reject(error); });
  return newPromise;
}

std::shared_ptr<Promise<Car>> HybridTestObjectCpp::awaitAndGetComplexPromise(const std::shared_ptr<Promise<Car>>& promise) {
  auto newPromise = Promise<Car>::create();
  promise->addOnResolvedListener([=](const Car& result) { newPromise->resolve(result); });
  promise->addOnRejectedListener([=](const std::exception_ptr& error) { newPromise->reject(error); });
  return newPromise;
}

std::shared_ptr<Promise<void>> HybridTestObjectCpp::awaitPromise(const std::shared_ptr<Promise<void>>& promise) {
  auto newPromise = Promise<void>::create();
  promise->addOnResolvedListener([=]() { newPromise->resolve(); });
  promise->addOnRejectedListener([=](const std::exception_ptr& error) { newPromise->reject(error); });
  return newPromise;
}

std::shared_ptr<Promise<void>> HybridTestObjectCpp::promiseThrows() {
  return Promise<void>::async([=]() { throw std::runtime_error("Promise throws :)"); });
}

void HybridTestObjectCpp::callAll(const std::function<void()>& first, const std::function<void()>& second,
                                  const std::function<void()>& third) {
  first();
  second();
  third();
}

std::shared_ptr<Promise<void>>
HybridTestObjectCpp::getValueFromJsCallback(const std::function<std::shared_ptr<Promise<std::string>>()>& callback,
                                            const std::function<void(const std::string& /* valueFromJs */)>& andThenCall) {
  return Promise<void>::async([=]() {
    std::shared_ptr<Promise<std::string>> promise = callback();
    std::future<std::string> future = promise->await();
    std::string jsValue = future.get();
    andThenCall(jsValue);
  });
}

Car HybridTestObjectCpp::getCar() {
  return Car(2018, "Lamborghini", "Huracan Performante", 640, Powertrain::GAS, std::nullopt, true);
}

bool HybridTestObjectCpp::isCarElectric(const Car& car) {
  return car.powertrain == Powertrain::ELECTRIC;
}

std::optional<Person> HybridTestObjectCpp::getDriver(const Car& car) {
  if (car.driver.has_value()) {
    return car.driver.value();
  } else {
    return std::nullopt;
  }
}

std::shared_ptr<ArrayBuffer> HybridTestObjectCpp::createArrayBuffer() {
  size_t size = 1024 * 1024 * 10; // 10MB
  uint8_t* buffer = new uint8_t[size];
  return std::make_shared<NativeArrayBuffer>(buffer, size, [=]() { delete[] buffer; });
}

double HybridTestObjectCpp::getBufferLastItem(const std::shared_ptr<ArrayBuffer>& buffer) {
  size_t size = buffer->size();
  if (size == 0) {
    throw std::runtime_error("ArrayBuffer's size is 0!");
  }
  uint8_t* data = buffer->data();
  if (data == nullptr) {
    throw std::runtime_error("ArrayBuffer's data is null!");
  }
  uint8_t lastItem = data[size - 1];
  return static_cast<double>(lastItem);
}

void HybridTestObjectCpp::setAllValuesTo(const std::shared_ptr<ArrayBuffer>& buffer, double value) {
  size_t size = buffer->size();
  if (size == 0) {
    throw std::runtime_error("ArrayBuffer's size is 0!");
  }
  uint8_t* data = buffer->data();
  if (data == nullptr) {
    throw std::runtime_error("ArrayBuffer's data is null!");
  }

  for (size_t i = 0; i < size; i++) {
    data[i] = static_cast<uint8_t>(value);
  }
}

std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> HybridTestObjectCpp::createArrayBufferAsync() {
  return Promise<std::shared_ptr<ArrayBuffer>>::async([this]() -> std::shared_ptr<ArrayBuffer> { return this->createArrayBuffer(); });
}

std::shared_ptr<HybridTestObjectCppSpec> HybridTestObjectCpp::newTestObject() {
  return std::make_shared<HybridTestObjectCpp>();
}

jsi::Value HybridTestObjectCpp::rawJsiFunc(jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* args, size_t count) {
  jsi::Array array(runtime, count);
  for (size_t i = 0; i < count; i++) {
    array.setValueAtIndex(runtime, i, jsi::Value(runtime, args[i]));
  }
  return array;
}

std::shared_ptr<HybridBaseSpec> HybridTestObjectCpp::createBase() {
  return std::make_shared<HybridBase>();
}

std::shared_ptr<HybridChildSpec> HybridTestObjectCpp::createChild() {
  return std::make_shared<HybridChild>();
}

std::shared_ptr<HybridBaseSpec> HybridTestObjectCpp::createBaseActualChild() {
  return std::make_shared<HybridChild>();
}

std::shared_ptr<HybridChildSpec> HybridTestObjectCpp::bounceChild(const std::shared_ptr<HybridChildSpec>& child) {
  return child;
}

std::shared_ptr<HybridBaseSpec> HybridTestObjectCpp::bounceBase(const std::shared_ptr<HybridBaseSpec>& base) {
  return base;
}

std::shared_ptr<HybridBaseSpec> HybridTestObjectCpp::bounceChildBase(const std::shared_ptr<HybridChildSpec>& child) {
  return child;
}

std::shared_ptr<HybridChildSpec> HybridTestObjectCpp::castBase(const std::shared_ptr<HybridBaseSpec>& base) {
  auto child = std::dynamic_pointer_cast<HybridChildSpec>(base);
  if (child == nullptr) {
    throw std::runtime_error("Cannot cast Base to Child!");
  }
  return child;
}

} // namespace margelo::nitro::image
