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
  explicit GlobalRefDeleter(jni::global_ref<typename T::javaobject> ref) : _ref(std::move(ref)) {}

  GlobalRefDeleter(const GlobalRefDeleter& copy) = delete;
  GlobalRefDeleter(GlobalRefDeleter&& move) = default;

  void operator()(T* /* cthis */) {
    // It's RAII - once `GlobalRefDeleter` goes out of scope, `jni::global_ref` will too.
    _ref = nullptr;
  }

private:
  jni::global_ref<typename T::javaobject> _ref;
};

class JNISharedPtr final {
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
  JNISharedPtr() = delete;
  ~JNISharedPtr() = delete;

public:
  /**
   * Creates a new `std::shared_ptr<T>` from the given `jni::global_ref<T::javaobject>`.
   */
  template <typename T, typename std::enable_if<is_base_template_of<T, jni::HybridClass>::value, int>::type = 0>
  static std::shared_ptr<T> make_shared_from_jni(jni::global_ref<typename T::javaobject>&& ref) {
    using RefType = jni::global_ref<typename T::javaobject>;

#ifdef NITRO_DEBUG
    if (ref == nullptr) [[unlikely]] {
      std::string typeName = TypeInfo::getFriendlyTypename<T>(true);
      throw std::runtime_error("Failed to wrap jni::global_ref<" + typeName + "::javaobject> in std::shared_ptr<" + typeName +
                               "> - it's null!");
    }
#endif
    return std::shared_ptr<T>(ref->cthis(), GlobalRefDeleter<T>(std::forward<RefType>(ref)));
  }

  /**
   * Creates a new `std::shared_ptr<T>` from the given `jni::global_ref<T::javaobject>` (copy)
   */
  template <typename T, typename std::enable_if<is_base_template_of<T, jni::HybridClass>::value, int>::type = 0>
  static std::shared_ptr<T> make_shared_from_jni(const jni::global_ref<typename T::javaobject>& ref) {
    auto copy = ref;
    return make_shared_from_jni<T>(std::move(copy));
  }
};

} // namespace margelo::nitro
