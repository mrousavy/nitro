//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

#include "NitroDefines.hpp"
#include "NitroTypeInfo.hpp"
#include <fbjni/fbjni.h>
#include <memory>

namespace margelo::nitro {

using namespace facebook;

template <typename T>
struct GlobalRefDeleter {
  explicit GlobalRefDeleter(const jni::global_ref<typename T::javaobject>& ref) : _ref(ref) {}
  explicit GlobalRefDeleter(jni::global_ref<typename T::javaobject>&& ref) : _ref(std::move(ref)) {}

  void operator()(T* /* cthis */) {
    if (_ref) {
      _ref.release();
    }
  }

private:
  jni::global_ref<typename T::javaobject> _ref;
};

class JNISharedPtr {
private:
  template <typename T, template <typename, typename...> class Base>
  struct is_base_template_of {
    template <typename U>
    static std::true_type test(Base<U>*) {}

    template <typename>
    static std::false_type test(...) {}

    static constexpr bool value = decltype(test<T>(nullptr))::value;
  };

public:
  template <typename T, typename std::enable_if<is_base_template_of<T, jni::HybridClass>::value, int>::type = 0>
  static std::shared_ptr<T> make_shared_from_jni(jni::global_ref<typename T::javaobject>&& ref) {
#ifdef NITRO_DEBUG
    if (ref == nullptr) [[unlikely]] {
      throw std::runtime_error("Failed to wrap jni::global_ref<" + TypeInfo::getFriendlyTypename<T>(true) +
                               "> in std::shared_ptr - it's null!");
    }
#endif
    return std::shared_ptr<T>(ref->cthis(), GlobalRefDeleter<T>(std::forward<T>(ref)));
  }
};

} // namespace margelo::nitro
