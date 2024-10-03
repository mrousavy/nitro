//
//  HybridChild.hpp
//  NitroImage
//
//  Created by Marc Rousavy on 03.10.24.
//

#pragma once

#include "HybridBase.hpp"
#include "HybridChildSpec.hpp"

namespace margelo::nitro::image {

using namespace facebook;

class HybridChild : public virtual HybridChildSpec, public virtual HybridBase {
public:
  explicit HybridChild() : HybridObject(HybridChildSpec::TAG) {}

public:
  double getChildValue() override {
    return 30;
  }
};

}; // namespace margelo::nitro::image
