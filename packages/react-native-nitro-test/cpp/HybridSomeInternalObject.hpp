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

  margelo::nitro::test::external::SomeExternalEnum bounceEnum(margelo::nitro::test::external::SomeExternalEnum value) override {
    return value;
  }

  margelo::nitro::test::external::SomeExternalStruct bounceStruct(const margelo::nitro::test::external::SomeExternalStruct& value) override {
    return value;
  }
};

}; // namespace margelo::nitro::test
