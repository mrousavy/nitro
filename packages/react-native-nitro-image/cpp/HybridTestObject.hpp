//
//  HybridTestObject.hpp
//  NitroImage
//
//  Created by Marc Rousavy on 30.07.24.
//

#pragma once

#include "HybridTestObjectSpec.hpp"
#include <jsi/jsi.h>

namespace margelo::nitro::image {

using namespace facebook;

class HybridTestObject : public HybridTestObjectSpec {
public:
  HybridTestObject() : HybridObject(TAG) {}

private:
  double _number;
  bool _bool;
  std::string _string;
  int64_t _bigint;
  std::optional<std::string> _optionalString;
  std::variant<std::string, double> _variant;
  std::tuple<double, std::string> _tuple;

private:
  static inline uint64_t calculateFibonacci(int count) noexcept {
    if (count <= 0) [[unlikely]]
      return 0;
    if (count == 1) [[unlikely]]
      return 1;

    return calculateFibonacci(count - 1) + calculateFibonacci(count - 2);
  }

public:
  // Properties
  double getNumberValue() override;
  void setNumberValue(double numberValue) override;
  bool getBoolValue() override;
  void setBoolValue(bool boolValue) override;
  std::string getStringValue() override;
  void setStringValue(const std::string& stringValue) override;
  int64_t getBigintValue() override;
  void setBigintValue(int64_t bigintValue) override;
  std::optional<std::string> getStringOrUndefined() override;
  void setStringOrUndefined(const std::optional<std::string>& stringOrUndefined) override;
  std::optional<std::string> getStringOrNull() override;
  void setStringOrNull(const std::optional<std::string>& stringOrNull) override;
  std::optional<std::string> getOptionalString() override;
  void setOptionalString(const std::optional<std::string>& optionalString) override;
  double getValueThatWillThrowOnAccess() override;
  void setValueThatWillThrowOnAccess(double valueThatWillThrowOnAccess) override;
  std::variant<std::string, double> getSomeVariant() override;
  void setSomeVariant(const std::variant<std::string, double>& variant) override;
  std::tuple<double, std::string> getSomeTuple() override;
  void setSomeTuple(const std::tuple<double, std::string>& tuple) override;
  std::shared_ptr<HybridTestObjectSpec> getSelf() override;

public:
  // Methods
  double addNumbers(double a, double b) override;
  std::string addStrings(const std::string& a, const std::string& b) override;
  void simpleFunc() override;
  void multipleArguments(double num, const std::string& str, bool boo) override;
  std::shared_ptr<AnyMap> createMap() override;
  std::shared_ptr<AnyMap> mapRoundtrip(const std::shared_ptr<AnyMap>& map) override;
  double funcThatThrows() override;
  std::string tryOptionalParams(double num, bool boo, const std::optional<std::string>& str) override;
  std::string tryMiddleParam(double num, std::optional<bool> boo, const std::string& str) override;
  std::variant<std::string, double>
  passVariant(const std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>>& either) override;

  std::variant<bool, OldEnum> getVariantEnum(const std::variant<bool, OldEnum>& variant) override;
  std::variant<Person, Car> getVariantObjects(const std::variant<Person, Car>& variant) override;
  std::variant<std::shared_ptr<margelo::nitro::image::HybridTestObjectSpec>, Person>
  getVariantHybrid(const std::variant<std::shared_ptr<margelo::nitro::image::HybridTestObjectSpec>, Person>& variant) override;
  std::variant<std::tuple<double, double>, std::tuple<double, double, double>>
  getVariantTuple(const std::variant<std::tuple<double, double>, std::tuple<double, double, double>>& variant) override;

  std::tuple<double, double, double> flip(const std::tuple<double, double, double>& tuple) override;
  std::tuple<double, std::string, bool> passTuple(const std::tuple<double, std::string, bool>& tuple) override;
  int64_t calculateFibonacciSync(double value) override;
  std::future<int64_t> calculateFibonacciAsync(double value) override;
  std::future<void> wait(double seconds) override;
  void callCallback(const std::function<void()>& callback) override;
  void getValueFromJSCallback(const std::function<std::future<double>()>& getValue) override;
  std::future<double> getValueFromJSCallbackAndWait(const std::function<std::future<double>()>& getValue) override;
  void callAll(const std::function<void()>& first, const std::function<void()>& second, const std::function<void()>& third) override;
  std::future<void> getValueFromJsCallback(const std::function<std::future<std::string>()>& callback,
                                           const std::function<void(const std::string& /* valueFromJs */)>& andThenCall) override;
  Car getCar() override;
  bool isCarElectric(const Car& car) override;
  std::optional<Person> getDriver(const Car& car) override;
  std::shared_ptr<ArrayBuffer> createArrayBuffer() override;
  double getBufferLastItem(const std::shared_ptr<ArrayBuffer>& buffer) override;
  void setAllValuesTo(const std::shared_ptr<ArrayBuffer>& buffer, double value) override;
  std::shared_ptr<HybridTestObjectSpec> newTestObject() override;

  // Raw JSI functions
  jsi::Value rawJsiFunc(jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* args, size_t count);

  void loadHybridMethods() override {
    // call base protoype
    HybridTestObjectSpec::loadHybridMethods();
    // register all methods we override here
    registerHybrids(this, [](Prototype& prototype) { prototype.registerHybridMethod("rawJsiFunc", &HybridTestObject::rawJsiFunc); });
  }
};

}; // namespace margelo::nitro::image
