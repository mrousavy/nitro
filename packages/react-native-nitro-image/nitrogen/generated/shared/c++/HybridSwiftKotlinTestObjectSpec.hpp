///
/// HybridSwiftKotlinTestObjectSpec.hpp
/// Sun Aug 11 2024
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/react-native-nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

#pragma once

#if __has_include(<NitroModules/HybridObject.hpp>)
#include <NitroModules/HybridObject.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif

// Forward declaration of `Car` to properly resolve imports.
namespace margelo::nitro::image { struct Car; }
// Forward declaration of `Person` to properly resolve imports.
namespace margelo::nitro::image { struct Person; }

#include "Func_void.hpp"
#include "Car.hpp"
#include "Person.hpp"

namespace margelo::nitro::image {

  using namespace margelo::nitro;

  /**
   * An abstract base class for `SwiftKotlinTestObject`
   * Inherit this class to create instances of `HybridSwiftKotlinTestObjectSpec` in C++.
   * @example
   * ```cpp
   * class HybridSwiftKotlinTestObject: public HybridSwiftKotlinTestObjectSpec {
   *   // ...
   * };
   * ```
   */
  class HybridSwiftKotlinTestObjectSpec: public HybridObject {
    public:
      // Constructor
      explicit HybridSwiftKotlinTestObjectSpec(): HybridObject(TAG) { }

      // Destructor
      ~HybridSwiftKotlinTestObjectSpec() { }

    public:
      // Properties
      virtual double getNumberValue() = 0;
      virtual void setNumberValue(double numberValue) = 0;
      virtual bool getBoolValue() = 0;
      virtual void setBoolValue(bool boolValue) = 0;
      virtual std::string getStringValue() = 0;
      virtual void setStringValue(const std::string& stringValue) = 0;
      virtual int64_t getBigintValue() = 0;
      virtual void setBigintValue(int64_t bigintValue) = 0;
      virtual std::optional<std::string> getStringOrUndefined() = 0;
      virtual void setStringOrUndefined(const std::optional<std::string>& stringOrUndefined) = 0;
      virtual std::optional<std::string> getStringOrNull() = 0;
      virtual void setStringOrNull(const std::optional<std::string>& stringOrNull) = 0;
      virtual std::optional<std::string> getOptionalString() = 0;
      virtual void setOptionalString(const std::optional<std::string>& optionalString) = 0;
      virtual double getValueThatWillThrowOnAccess() = 0;
      virtual void setValueThatWillThrowOnAccess(double valueThatWillThrowOnAccess) = 0;
      virtual std::tuple<double, std::string> getSomeTuple() = 0;
      virtual void setSomeTuple(const std::tuple<double, std::string>& someTuple) = 0;

    public:
      // Methods
      virtual void simpleFunc() = 0;
      virtual double addNumbers(double a, double b) = 0;
      virtual std::string addStrings(const std::string& a, const std::string& b) = 0;
      virtual void multipleArguments(double num, const std::string& str, bool boo) = 0;
      virtual double funcThatThrows() = 0;
      virtual std::string tryOptionalParams(double num, bool boo, const std::optional<std::string>& str) = 0;
      virtual std::string tryMiddleParam(double num, std::optional<bool> boo, const std::string& str) = 0;
      virtual std::tuple<double, double, double> flip(const std::tuple<double, double, double>& tuple) = 0;
      virtual std::tuple<double, std::string, bool> passTuple(const std::tuple<double, std::string, bool>& tuple) = 0;
      virtual int64_t calculateFibonacciSync(double value) = 0;
      virtual std::future<int64_t> calculateFibonacciAsync(double value) = 0;
      virtual std::future<void> wait(double seconds) = 0;
      virtual void callCallback(const Func_void& callback) = 0;
      virtual void callAll(const Func_void& first, const Func_void& second, const Func_void& third) = 0;
      virtual Car getCar() = 0;
      virtual bool isCarElectric(const Car& car) = 0;
      virtual std::optional<Person> getDriver(const Car& car) = 0;

    protected:
      // Hybrid Setup
      void loadHybridMethods() override;

    protected:
      // Tag for logging
      static constexpr auto TAG = "SwiftKotlinTestObject";
  };

} // namespace margelo::nitro::image
