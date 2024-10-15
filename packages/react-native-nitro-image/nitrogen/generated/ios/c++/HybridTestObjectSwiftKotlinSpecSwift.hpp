///
/// HybridTestObjectSwiftKotlinSpecSwift.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

#pragma once

#include "HybridTestObjectSwiftKotlinSpec.hpp"

// Forward declaration of `HybridTestObjectSwiftKotlinSpecCxx` to properly resolve imports.
namespace NitroImage { class HybridTestObjectSwiftKotlinSpecCxx; }

// Forward declaration of `HybridTestObjectSwiftKotlinSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridTestObjectSwiftKotlinSpec; }
// Forward declaration of `HybridTestObjectSwiftKotlinSpecSwift` to properly resolve imports.
namespace margelo::nitro::image { class HybridTestObjectSwiftKotlinSpecSwift; }
// Forward declaration of `Person` to properly resolve imports.
namespace margelo::nitro::image { struct Person; }
// Forward declaration of `Powertrain` to properly resolve imports.
namespace margelo::nitro::image { enum class Powertrain; }
// Forward declaration of `AnyMap` to properly resolve imports.
namespace NitroModules { class AnyMap; }
// Forward declaration of `Car` to properly resolve imports.
namespace margelo::nitro::image { struct Car; }
// Forward declaration of `ArrayBuffer` to properly resolve imports.
namespace NitroModules { class ArrayBuffer; }
// Forward declaration of `ArrayBufferHolder` to properly resolve imports.
namespace NitroModules { class ArrayBufferHolder; }
// Forward declaration of `HybridChildSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridChildSpec; }
// Forward declaration of `HybridChildSpecSwift` to properly resolve imports.
namespace margelo::nitro::image { class HybridChildSpecSwift; }
// Forward declaration of `HybridBaseSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridBaseSpec; }
// Forward declaration of `HybridBaseSpecSwift` to properly resolve imports.
namespace margelo::nitro::image { class HybridBaseSpecSwift; }

#include <memory>
#include "HybridTestObjectSwiftKotlinSpec.hpp"
#include "HybridTestObjectSwiftKotlinSpecSwift.hpp"
#include <string>
#include <optional>
#include <variant>
#include <vector>
#include "Person.hpp"
#include "Powertrain.hpp"
#include <functional>
#include <NitroModules/AnyMap.hpp>
#include <future>
#include <NitroModules/PromiseHolder.hpp>
#include "Car.hpp"
#include <NitroModules/ArrayBuffer.hpp>
#include <NitroModules/ArrayBufferHolder.hpp>
#include "HybridChildSpec.hpp"
#include "HybridChildSpecSwift.hpp"
#include "HybridBaseSpec.hpp"
#include "HybridBaseSpecSwift.hpp"

#if __has_include(<NitroModules/HybridContext.hpp>)
#include <NitroModules/HybridContext.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif

#include "NitroImage-Swift-Cxx-Umbrella.hpp"

namespace margelo::nitro::image {

  /**
   * The C++ part of HybridTestObjectSwiftKotlinSpecCxx.swift.
   *
   * HybridTestObjectSwiftKotlinSpecSwift (C++) accesses HybridTestObjectSwiftKotlinSpecCxx (Swift), and might
   * contain some additional bridging code for C++ <> Swift interop.
   *
   * Since this obviously introduces an overhead, I hope at some point in
   * the future, HybridTestObjectSwiftKotlinSpecCxx can directly inherit from the C++ class HybridTestObjectSwiftKotlinSpec
   * to simplify the whole structure and memory management.
   */
  class HybridTestObjectSwiftKotlinSpecSwift: public virtual HybridTestObjectSwiftKotlinSpec {
  public:
    // Constructor from a Swift instance
    explicit HybridTestObjectSwiftKotlinSpecSwift(const NitroImage::HybridTestObjectSwiftKotlinSpecCxx& swiftPart);

  public:
    // Get the Swift part
    NitroImage::HybridTestObjectSwiftKotlinSpecCxx getSwiftPart() noexcept;

  public:
    // Get memory pressure
    size_t getExternalMemorySize() noexcept override;

  public:
    // Properties
    std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec> getThisObject() noexcept override;
    double getNumberValue() noexcept override;
    void setNumberValue(double numberValue) noexcept override;
    bool getBoolValue() noexcept override;
    void setBoolValue(bool boolValue) noexcept override;
    std::string getStringValue() noexcept override;
    void setStringValue(const std::string& stringValue) noexcept override;
    int64_t getBigintValue() noexcept override;
    void setBigintValue(int64_t bigintValue) noexcept override;
    std::optional<std::string> getStringOrUndefined() noexcept override;
    void setStringOrUndefined(const std::optional<std::string>& stringOrUndefined) noexcept override;
    std::optional<std::string> getStringOrNull() noexcept override;
    void setStringOrNull(const std::optional<std::string>& stringOrNull) noexcept override;
    std::optional<std::string> getOptionalString() noexcept override;
    void setOptionalString(const std::optional<std::string>& optionalString) noexcept override;
    std::variant<std::string, double> getSomeVariant() noexcept override;
    void setSomeVariant(const std::variant<std::string, double>& someVariant) noexcept override;

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
    double funcThatThrows() override;
    std::string tryOptionalParams(double num, bool boo, const std::optional<std::string>& str) override;
    std::string tryMiddleParam(double num, std::optional<bool> boo, const std::string& str) override;
    std::optional<Powertrain> tryOptionalEnum(std::optional<Powertrain> value) override;
    int64_t calculateFibonacciSync(double value) override;
    std::future<int64_t> calculateFibonacciAsync(double value) override;
    std::future<void> wait(double seconds) override;
    void callCallback(const std::function<void()>& callback) override;
    void callAll(const std::function<void()>& first, const std::function<void()>& second, const std::function<void()>& third) override;
    void callWithOptional(std::optional<double> value, const std::function<void(std::optional<double> /* maybe */)>& callback) override;
    Car getCar() override;
    bool isCarElectric(const Car& car) override;
    std::optional<Person> getDriver(const Car& car) override;
    std::shared_ptr<ArrayBuffer> createArrayBuffer() override;
    double getBufferLastItem(const std::shared_ptr<ArrayBuffer>& buffer) override;
    void setAllValuesTo(const std::shared_ptr<ArrayBuffer>& buffer, double value) override;
    std::shared_ptr<margelo::nitro::image::HybridChildSpec> createChild() override;
    std::shared_ptr<margelo::nitro::image::HybridBaseSpec> createBase() override;
    std::shared_ptr<margelo::nitro::image::HybridBaseSpec> createBaseActualChild() override;
    std::shared_ptr<margelo::nitro::image::HybridChildSpec> bounceChild(const std::shared_ptr<margelo::nitro::image::HybridChildSpec>& child) override;
    std::shared_ptr<margelo::nitro::image::HybridBaseSpec> bounceBase(const std::shared_ptr<margelo::nitro::image::HybridBaseSpec>& base) override;
    std::shared_ptr<margelo::nitro::image::HybridBaseSpec> bounceChildBase(const std::shared_ptr<margelo::nitro::image::HybridChildSpec>& child) override;
    std::shared_ptr<margelo::nitro::image::HybridChildSpec> castBase(const std::shared_ptr<margelo::nitro::image::HybridBaseSpec>& base) override;

  private:
    NitroImage::HybridTestObjectSwiftKotlinSpecCxx _swiftPart;
  };

} // namespace margelo::nitro::image
