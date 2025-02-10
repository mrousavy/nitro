//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

#include <fbjni/fbjni.h>
#include <memory>
#include "JNIConcepts.hpp"

namespace margelo::nitro {

using namespace facebook;

template <SomeHybridClass T>
struct GlobalRefDeleter {
  explicit GlobalRefDeleter(jni::global_ref<typename T::javaobject> ref) : _ref(ref) {}

  void operator()(T* /* cthis */) {
    if (_ref) {
      _ref.release();
    }
  }

private:
  jni::global_ref<typename T::javaobject> _ref;
};

class JNISharedPtr {
public:
  template <SomeHybridClass T>
  static std::shared_ptr<T> make_shared_from_jni(jni::global_ref<typename T::javaobject> ref) {
    return std::shared_ptr<T>(ref->cthis(), GlobalRefDeleter<T>{ref});
  }
};

} // namespace margelo::nitro
