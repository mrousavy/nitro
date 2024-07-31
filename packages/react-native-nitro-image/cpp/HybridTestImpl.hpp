//
//  HybridTestImpl.hpp
//  NitroImage
//
//  Created by Marc Rousavy on 30.07.24.
//

#pragma once

#include "HybridTestObject.hpp"

namespace margelo::nitro::image {

class HybridTestObjectImpl : public HybridTestObject {
public:
  std::future<void> getValueFromJsCallback(const Func_std__future_std__string_& callback,
                                           const Func_void_std__string& andThenCall) override;

  std::variant<std::string, double>
  passVariant(const std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>>& either) override;

  std::shared_ptr<AnyMap> mapRoundtrip(const std::shared_ptr<AnyMap>& map) override;
  std::shared_ptr<AnyMap> createMap() override;
};

}; // namespace margelo::nitro::image
