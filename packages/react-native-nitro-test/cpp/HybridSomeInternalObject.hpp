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
    return "subclass!";
  }

  ExternalEnum bounceEnum(ExternalEnum value) override {
    return value;
  }

  ExternalStruct bounceStruct(ExternalStruct value) override {
    return value;
  }

  bool getIsSubclass() override {
    return true;
  }
};

}; // namespace margelo::nitro::test
