//
//  JHybridObjectCppReference.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 02.03.26.
//

#pragma once

#include "HybridObject.hpp"
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

class JHybridObjectCppReference : public jni::HybridClass<JHybridObjectCppReference> {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/HybridObjectCppReference;";

  template <typename T>
  std::shared_ptr<HybridObject> getCppPart() {
    if (auto cppPart = _cppPart.lock()) {
     return cppPart;
    }
    std::shared_ptr<T> cppPart = std::make_shared<T>(_javaPart);
    _cppPart = cppPart;
    return cppPart;
  }

private:
  std::weak_ptr<HybridObject> _cppPart;
  jni::global_ref<JavaPart> _javaPart;
};

} // namespace margelo::nitro
