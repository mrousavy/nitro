///
/// HybridTestObjectSpec.hpp
/// Fri Aug 02 2024
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

// Forward declaration of `AnyMap` to properly resolve imports.
namespace NitroModules { class AnyMap; }

#include "NitroModules/AnyMap.hpp"
#include "Func_std__future_std__string_.hpp"
#include "Func_void_std__string.hpp"

namespace margelo::nitro::image {

  using namespace margelo::nitro;

  /**
   * An abstract base class for `TestObject`
   * Inherit this class to create instances of `HybridTestObjectSpec` in C++.
   * @example
   * ```cpp
   * class HybridTestObject: public HybridTestObjectSpec {
   *   // ...
   * };
   * ```
   */
  class HybridTestObjectSpec: public HybridObject {
    public:
      // Constructor
      explicit HybridTestObjectSpec(): HybridObject(TAG) { }

      // Destructor
      ~HybridTestObjectSpec() { }

    public:
      // Properties
      virtual double getValueThatWillThrowOnAccess() = 0;
      virtual void setValueThatWillThrowOnAccess(double valueThatWillThrowOnAccess) = 0;

    public:
      // Methods
      virtual std::shared_ptr<AnyMap> createMap() = 0;
      virtual std::shared_ptr<AnyMap> mapRoundtrip(std::shared_ptr<AnyMap> map) = 0;
      virtual double funcThatThrows() = 0;
      virtual std::variant<std::string, double> passVariant(const std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>>& either) = 0;
      virtual std::tuple<double, double, double> flip(const std::tuple<double, double, double>& vector) = 0;
      virtual std::tuple<double, std::string, bool> passTuple(const std::tuple<double, std::string, bool>& tuple) = 0;
      virtual std::future<void> getValueFromJsCallback(const Func_std__future_std__string_& callback, const Func_void_std__string& andThenCall) = 0;

    protected:
      // Tag for logging
      static constexpr auto TAG = "TestObject";

    protected:
      // Hybrid Setup
      void loadHybridMethods() override;
  };

} // namespace margelo::nitro::image
