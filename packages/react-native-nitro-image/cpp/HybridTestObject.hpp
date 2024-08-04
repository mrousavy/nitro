//
//  HybridTestObject.hpp
//  NitroImage
//
//  Created by Marc Rousavy on 30.07.24.
//

#pragma once

#include "HybridTestObjectSpec.hpp"

namespace margelo::nitro::image {

class HybridTestObject : public HybridTestObjectSpec {
public:
  std::future<void> getValueFromJsCallback(const Func_std__future_std__string_& callback,
                                           const Func_void_std__string& andThenCall) override;

  // Variant tests
  std::variant<std::string, double>
  passVariant(const std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>>& either) override;

  // Map tests
  std::shared_ptr<AnyMap> mapRoundtrip(std::shared_ptr<AnyMap> map) override;
  std::shared_ptr<AnyMap> createMap() override;

  // Tuple tests
  std::tuple<double, double, double> flip(const std::tuple<double, double, double>& vector) override;
  std::tuple<double, std::string, bool> passTuple(const std::tuple<double, std::string, bool>& tuple) override;

  // Error tests
  double getValueThatWillThrowOnAccess() override;
  void setValueThatWillThrowOnAccess(double valueThatWillThrowOnAccess) override;
  double funcThatThrows() override;

  // Optional params
  std::string tryOptionalParams(double num, bool boo, const std::optional<std::string>& optionalString) override {
    if (optionalString.has_value()) {
      return optionalString.value();
    } else {
      return "omitted!";
    }
  }
};

}; // namespace margelo::nitro::image
