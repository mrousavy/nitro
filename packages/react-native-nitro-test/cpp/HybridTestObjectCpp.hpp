//
//  HybridTestObjectCpp.hpp
//  NitroTest
//
//  Created by Marc Rousavy on 30.07.24.
//

#pragma once

#include "HybridTestObjectCppSpec.hpp"
#include <jsi/jsi.h>

namespace margelo::nitro::test {

using namespace facebook;

class HybridTestObjectCpp : public HybridTestObjectCppSpec {
public:
  HybridTestObjectCpp() : HybridObject(TAG) {}

private:
  double _number;
  bool _bool;
  std::string _string;
  int64_t _bigint;
  std::optional<std::string> _optionalString;
  std::variant<std::string, double> _variant;
  std::tuple<double, std::string> _tuple;
  std::optional<std::vector<std::string>> _optionalArray;
  std::optional<std::shared_ptr<HybridTestObjectCppSpec>> _optionalHybrid;
  std::optional<Powertrain> _optionalEnum;
  std::optional<OldEnum> _optionalOldEnum;
  std::optional<std::function<void(double)>> _optionalCallback;

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
  std::optional<std::vector<std::string>> getOptionalArray() override;
  void setOptionalArray(const std::optional<std::vector<std::string>>& optionalArray) override;
  std::variant<std::string, double> getSomeVariant() override;
  void setSomeVariant(const std::variant<std::string, double>& variant) override;
  std::variant<std::string, Car> passNamedVariant(const std::variant<std::string, Car>& variant) override;
  std::tuple<double, std::string> getSomeTuple() override;
  void setSomeTuple(const std::tuple<double, std::string>& tuple) override;
  std::shared_ptr<HybridTestObjectCppSpec> getThisObject() override;
  std::optional<std::shared_ptr<HybridTestObjectCppSpec>> getOptionalHybrid() override;
  void setOptionalHybrid(const std::optional<std::shared_ptr<HybridTestObjectCppSpec>>& optionalHybrid) override;
  std::optional<Powertrain> getOptionalEnum() override;
  void setOptionalEnum(std::optional<Powertrain> optionalEnum) override;
  std::optional<OldEnum> getOptionalOldEnum() override;
  void setOptionalOldEnum(std::optional<OldEnum> optionalOldEnum) override;
  std::optional<std::function<void(double)>> getOptionalCallback() override;
  void setOptionalCallback(const std::optional<std::function<void(double)>>& callback) override;

public:
  // Methods
  double addNumbers(double a, double b) override;
  std::string addStrings(const std::string& a, const std::string& b) override;
  void simpleFunc() override;
  void multipleArguments(double num, const std::string& str, bool boo) override;
  std::shared_ptr<AnyMap> createMap() override;
  std::shared_ptr<AnyMap> mapRoundtrip(const std::shared_ptr<AnyMap>& map) override;
  std::vector<std::string> getMapKeys(const std::shared_ptr<AnyMap>& map) override;
  double funcThatThrows() override;
  std::shared_ptr<Promise<void>> funcThatThrowsBeforePromise() override;
  void throwError(const std::exception_ptr& error) override;
  std::string tryOptionalParams(double num, bool boo, const std::optional<std::string>& str) override;
  std::string tryMiddleParam(double num, std::optional<bool> boo, const std::string& str) override;
  std::optional<Powertrain> tryOptionalEnum(std::optional<Powertrain> value) override;
  std::chrono::system_clock::time_point add1Hour(std::chrono::system_clock::time_point date) override;
  std::chrono::system_clock::time_point currentDate() override;
  std::variant<std::string, double>
  passVariant(const std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>>& either) override;

  std::vector<std::string> bounceStrings(const std::vector<std::string>& array) override;
  std::vector<double> bounceNumbers(const std::vector<double>& array) override;
  std::vector<Person> bounceStructs(const std::vector<Person>& array) override;
  std::vector<Powertrain> bounceEnums(const std::vector<Powertrain>& array) override;
  void complexEnumCallback(const std::vector<Powertrain>& array,
                           const std::function<void(const std::vector<Powertrain>& /* array */)>& callback) override;

  std::variant<bool, OldEnum> getVariantEnum(const std::variant<bool, OldEnum>& variant) override;
  std::variant<Car, Person> getVariantObjects(const std::variant<Car, Person>& variant) override;
  std::variant<std::shared_ptr<HybridTestObjectCppSpec>, Person>
  getVariantHybrid(const std::variant<std::shared_ptr<HybridTestObjectCppSpec>, Person>& variant) override;
  std::variant<std::tuple<double, double>, std::tuple<double, double, double>>
  getVariantTuple(const std::variant<std::tuple<double, double>, std::tuple<double, double, double>>& variant) override;

  std::tuple<double, double, double> flip(const std::tuple<double, double, double>& tuple) override;
  std::tuple<double, std::string, bool> passTuple(const std::tuple<double, std::string, bool>& tuple) override;
  std::unordered_map<std::string, std::variant<double, bool>>
  bounceMap(const std::unordered_map<std::string, std::variant<double, bool>>& map) override;
  std::unordered_map<std::string, std::string> extractMap(const MapWrapper& mapWrapper) override;
  int64_t calculateFibonacciSync(double value) override;
  std::shared_ptr<Promise<int64_t>> calculateFibonacciAsync(double value) override;
  std::shared_ptr<Promise<void>> wait(double seconds) override;
  void callCallback(const std::function<void()>& callback) override;
  void callWithOptional(std::optional<double> value, const std::function<void(std::optional<double> /* maybe */)>& callback) override;
  std::shared_ptr<Promise<double>>
  getValueFromJSCallbackAndWait(const std::function<std::shared_ptr<Promise<double>>()>& getValue) override;
  void callAll(const std::function<void()>& first, const std::function<void()>& second, const std::function<void()>& third) override;
  std::shared_ptr<Promise<double>> callSumUpNTimes(const std::function<std::shared_ptr<Promise<double>>()>& callback, double n) override;
  std::shared_ptr<Promise<double>>
  callbackAsyncPromise(const std::function<std::shared_ptr<Promise<std::shared_ptr<Promise<double>>>>()>& callback) override;
  std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> callbackAsyncPromiseBuffer(
      const std::function<std::shared_ptr<Promise<std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>>>()>& callback) override;
  std::function<void(double)> getComplexCallback() override;

  std::shared_ptr<Promise<void>>
  getValueFromJsCallback(const std::function<std::shared_ptr<Promise<std::string>>()>& callback,
                         const std::function<void(const std::string& /* valueFromJs */)>& andThenCall) override;
  std::shared_ptr<Promise<double>> awaitAndGetPromise(const std::shared_ptr<Promise<double>>& promise) override;
  std::shared_ptr<Promise<Car>> awaitAndGetComplexPromise(const std::shared_ptr<Promise<Car>>& promise) override;
  std::shared_ptr<Promise<void>> awaitPromise(const std::shared_ptr<Promise<void>>& promise) override;
  std::shared_ptr<Promise<void>> promiseThrows() override;
  Car getCar() override;
  bool isCarElectric(const Car& car) override;
  std::optional<Person> getDriver(const Car& car) override;
  void jsStyleObjectAsParameters(const JsStyleStruct& params) override;
  std::shared_ptr<ArrayBuffer> createArrayBufferFromNativeBuffer(bool /* copy */) override;
  std::shared_ptr<ArrayBuffer> createArrayBuffer() override;
  std::shared_ptr<ArrayBuffer> copyBuffer(const std::shared_ptr<ArrayBuffer>& buffer) override;
  std::shared_ptr<ArrayBuffer> bounceArrayBuffer(const std::shared_ptr<ArrayBuffer>& buffer) override;
  double getBufferLastItem(const std::shared_ptr<ArrayBuffer>& buffer) override;
  void setAllValuesTo(const std::shared_ptr<ArrayBuffer>& buffer, double value) override;
  std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> createArrayBufferAsync() override;
  std::shared_ptr<HybridTestObjectCppSpec> newTestObject() override;

  std::shared_ptr<HybridBaseSpec> createBase() override;
  std::shared_ptr<HybridChildSpec> createChild() override;
  std::shared_ptr<HybridBaseSpec> createBaseActualChild() override;
  std::shared_ptr<HybridChildSpec> bounceChild(const std::shared_ptr<HybridChildSpec>& child) override;
  std::shared_ptr<HybridBaseSpec> bounceBase(const std::shared_ptr<HybridBaseSpec>& base) override;
  std::shared_ptr<HybridBaseSpec> bounceChildBase(const std::shared_ptr<HybridChildSpec>& child) override;
  std::shared_ptr<HybridChildSpec> castBase(const std::shared_ptr<HybridBaseSpec>& base) override;

  bool getIsViewBlue(const std::shared_ptr<HybridTestViewSpec>& view) override;
  double callbackSync(const std::function<double()>& callback) override;

  // Raw JSI functions
  jsi::Value rawJsiFunc(jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* args, size_t count);

  void loadHybridMethods() override {
    // call base protoype
    HybridTestObjectCppSpec::loadHybridMethods();
    // register all methods we override here
    registerHybrids(this,
                    [](Prototype& prototype) { prototype.registerRawHybridMethod("rawJsiFunc", 0, &HybridTestObjectCpp::rawJsiFunc); });
  }
};

}; // namespace margelo::nitro::test
