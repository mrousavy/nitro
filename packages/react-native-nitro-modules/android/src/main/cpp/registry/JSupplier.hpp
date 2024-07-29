//
//  JSupplier.hpp
//  DoubleConversion
//
//  Created by Marc Rousavy on 22.07.24.
//

#pragma once

#include <fbjni/fbjni.h>

namespace margelo::nitro {

  using namespace facebook;

  struct JSupplier: public jni::JavaClass<JSupplier> {
  public:
    jni::alias_ref<jobject> call() {
      const auto method = getClass()->getMethod<jobject()>("get");
      return method(self());
    }

  public:
    static auto constexpr kJavaDescriptor = "Ljava/util/function/Supplier;";
  };

} // namespace margelo::nitro
