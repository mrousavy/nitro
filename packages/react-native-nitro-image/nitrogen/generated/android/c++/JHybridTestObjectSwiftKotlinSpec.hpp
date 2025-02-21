///
/// HybridTestObjectSwiftKotlinSpec.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include <NitroModules/JHybridObject.hpp>
#include <fbjni/fbjni.h>
#include "HybridTestObjectSwiftKotlinSpec.hpp"




namespace margelo::nitro::image {

  using namespace facebook;

  class JHybridTestObjectSwiftKotlinSpec: public jni::HybridClass<JHybridTestObjectSwiftKotlinSpec, JHybridObject>,
                                          public virtual HybridTestObjectSwiftKotlinSpec {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/HybridTestObjectSwiftKotlinSpec;";
    static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis);
    static void registerNatives();

  protected:
    // C++ constructor (called from Java via `initHybrid()`)
    explicit JHybridTestObjectSwiftKotlinSpec(jni::alias_ref<jhybridobject> jThis) :
      HybridObject(HybridTestObjectSwiftKotlinSpec::TAG),
      _javaPart(jni::make_global(jThis)) {}

  public:
    ~JHybridTestObjectSwiftKotlinSpec() override {
      // Hermes GC can destroy JS objects on a non-JNI Thread.
      jni::ThreadScope::WithClassLoader([&] { _javaPart.reset(); });
    }

  public:
    size_t getExternalMemorySize() noexcept override;

  public:
    inline const jni::global_ref<JHybridTestObjectSwiftKotlinSpec::javaobject>& getJavaPart() const noexcept {
      return _javaPart;
    }

  public:
    // Properties
    std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec> getThisObject() override;
    std::optional<std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec>> getOptionalHybrid() override;
    void setOptionalHybrid(const std::optional<std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec>>& optionalHybrid) override;
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
    std::optional<Powertrain> getOptionalEnum() override;
    void setOptionalEnum(std::optional<Powertrain> optionalEnum) override;
    std::optional<OldEnum> getOptionalOldEnum() override;
    void setOptionalOldEnum(std::optional<OldEnum> optionalOldEnum) override;
    std::optional<std::function<void(double /* value */)>> getOptionalCallback() override;
    void setOptionalCallback(const std::optional<std::function<void(double /* value */)>>& optionalCallback) override;
    std::variant<std::string, double> getSomeVariant() override;
    void setSomeVariant(const std::variant<std::string, double>& someVariant) override;

  public:
    // Methods
    std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec> newTestObject() override;
    void simpleFunc() override;
    double addNumbers(double a, double b) override;
    std::string addStrings(const std::string& a, const std::string& b) override;
    void multipleArguments(double num, const std::string& str, bool boo) override;
    std::vector<std::string> bounceStrings(const std::vector<std::string>& array) override;
    std::vector<double> bounceNumbers(const std::vector<double>& array) override;
    std::vector<Person> bounceStructs(const std::vector<Person>& array) override;
    std::vector<Powertrain> bounceEnums(const std::vector<Powertrain>& array) override;
    void complexEnumCallback(const std::vector<Powertrain>& array, const std::function<void(const std::vector<Powertrain>& /* array */)>& callback) override;
    std::shared_ptr<AnyMap> createMap() override;
    std::shared_ptr<AnyMap> mapRoundtrip(const std::shared_ptr<AnyMap>& map) override;
    std::unordered_map<std::string, std::variant<double, bool>> bounceMap(const std::unordered_map<std::string, std::variant<double, bool>>& map) override;
    std::unordered_map<std::string, std::string> extractMap(const MapWrapper& mapWrapper) override;
    double funcThatThrows() override;
    std::shared_ptr<Promise<void>> funcThatThrowsBeforePromise() override;
    void throwError(const std::exception_ptr& error) override;
    std::string tryOptionalParams(double num, bool boo, const std::optional<std::string>& str) override;
    std::string tryMiddleParam(double num, std::optional<bool> boo, const std::string& str) override;
    std::optional<Powertrain> tryOptionalEnum(std::optional<Powertrain> value) override;
    int64_t calculateFibonacciSync(double value) override;
    std::shared_ptr<Promise<int64_t>> calculateFibonacciAsync(double value) override;
    std::shared_ptr<Promise<void>> wait(double seconds) override;
    std::shared_ptr<Promise<void>> promiseThrows() override;
    std::shared_ptr<Promise<double>> awaitAndGetPromise(const std::shared_ptr<Promise<double>>& promise) override;
    std::shared_ptr<Promise<Car>> awaitAndGetComplexPromise(const std::shared_ptr<Promise<Car>>& promise) override;
    std::shared_ptr<Promise<void>> awaitPromise(const std::shared_ptr<Promise<void>>& promise) override;
    void callCallback(const std::function<void()>& callback) override;
    void callAll(const std::function<void()>& first, const std::function<void()>& second, const std::function<void()>& third) override;
    void callWithOptional(std::optional<double> value, const std::function<void(std::optional<double> /* maybe */)>& callback) override;
    std::shared_ptr<Promise<double>> callSumUpNTimes(const std::function<std::shared_ptr<Promise<double>>()>& callback, double n) override;
    std::shared_ptr<Promise<double>> callbackAsyncPromise(const std::function<std::shared_ptr<Promise<std::shared_ptr<Promise<double>>>>()>& callback) override;
    std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> callbackAsyncPromiseBuffer(const std::function<std::shared_ptr<Promise<std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>>>()>& callback) override;
    std::function<void(double /* value */)> getComplexCallback() override;
    std::shared_ptr<Promise<double>> getValueFromJSCallbackAndWait(const std::function<std::shared_ptr<Promise<double>>()>& getValue) override;
    std::shared_ptr<Promise<void>> getValueFromJsCallback(const std::function<std::shared_ptr<Promise<std::string>>()>& callback, const std::function<void(const std::string& /* valueFromJs */)>& andThenCall) override;
    Car getCar() override;
    bool isCarElectric(const Car& car) override;
    std::optional<Person> getDriver(const Car& car) override;
    void jsStyleObjectAsParameters(const JsStyleStruct& params) override;
    std::shared_ptr<ArrayBuffer> createArrayBuffer() override;
    double getBufferLastItem(const std::shared_ptr<ArrayBuffer>& buffer) override;
    void setAllValuesTo(const std::shared_ptr<ArrayBuffer>& buffer, double value) override;
    std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> createArrayBufferAsync() override;
    std::shared_ptr<margelo::nitro::image::HybridChildSpec> createChild() override;
    std::shared_ptr<margelo::nitro::image::HybridBaseSpec> createBase() override;
    std::shared_ptr<margelo::nitro::image::HybridBaseSpec> createBaseActualChild() override;
    std::shared_ptr<margelo::nitro::image::HybridChildSpec> bounceChild(const std::shared_ptr<margelo::nitro::image::HybridChildSpec>& child) override;
    std::shared_ptr<margelo::nitro::image::HybridBaseSpec> bounceBase(const std::shared_ptr<margelo::nitro::image::HybridBaseSpec>& base) override;
    std::shared_ptr<margelo::nitro::image::HybridBaseSpec> bounceChildBase(const std::shared_ptr<margelo::nitro::image::HybridChildSpec>& child) override;
    std::shared_ptr<margelo::nitro::image::HybridChildSpec> castBase(const std::shared_ptr<margelo::nitro::image::HybridBaseSpec>& base) override;
    bool getIsViewBlue(const std::shared_ptr<margelo::nitro::image::HybridTestViewSpec>& view) override;

  private:
    friend HybridBase;
    using HybridBase::HybridBase;
    jni::global_ref<JHybridTestObjectSwiftKotlinSpec::javaobject> _javaPart;
  };

} // namespace margelo::nitro::image
