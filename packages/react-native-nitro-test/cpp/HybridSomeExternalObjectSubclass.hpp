//
//  HybridSomeInternalObject.hpp
//  NitroTest
//
//  Created by Marc Rousavy on 14.08.25.
//

#pragma once

#include "HybridSomeExternalObjectSubclass.hpp"

namespace margelo::nitro::test {

using namespace facebook;

class HybridSomeExternalObjectSubclass : public virtual HybridSomeExternalObjectSubclassSpec {
public:
  HybridSomeExternalObjectSubclass() : HybridObject(TAG) {}

public:
  std::string getValue() override {
    return "subclass!";
  }

  margelo::nitro::test::external::SomeExternalEnum bounceEnum(margelo::nitro::test::external::SomeExternalEnum value) override {
    return value;
  }

  margelo::nitro::test::external::SomeExternalStruct
  bounceStruct(const margelo::nitro::test::external::SomeExternalStruct& value) override {
    return value;
  }

  bool getIsSubclass() override {
    return true;
  }
};

}; // namespace margelo::nitro::test
