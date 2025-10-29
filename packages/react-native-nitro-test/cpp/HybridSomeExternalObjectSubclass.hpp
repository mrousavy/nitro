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
    return "This is overridden!";
  }
};

}; // namespace margelo::nitro::test
