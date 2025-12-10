//
//  HybridSomeInternalObject.hpp
//  NitroTest
//
//  Created by Marc Rousavy on 14.08.25.
//

#pragma once

#include <NitroTestExternal/HybridSomeExternalObjectSpec.hpp>

namespace margelo::nitro::test {

using namespace facebook;

class HybridSomeInternalObject : public virtual margelo::nitro::test::external::HybridSomeExternalObjectSpec {
public:
  HybridSomeInternalObject() : HybridObject(TAG) {}

public:
  std::string getValue() override {
    return "This is overridden!";
  }

  std::optional<double> getNumberOrUndefined() override {
    return 10.0;
  }
};

}; // namespace margelo::nitro::test
