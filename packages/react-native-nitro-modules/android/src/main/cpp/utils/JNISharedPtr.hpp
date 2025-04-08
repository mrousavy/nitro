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

  // Helper to detect if T inherits from std::enable_shared_from_this
  template <typename T>
  struct is_enable_shared_from_this : std::is_base_of<std::enable_shared_from_this<T>, T> {};

public:
  JNISharedPtr() = delete;
  ~JNISharedPtr() = delete;

public:
  /**
   * Creates a new `std::shared_ptr<T>` from the given `jni::global_ref<T::javaobject>`.
   * This version properly supports classes that inherit from std::enable_shared_from_this.
   */
  template <typename T, typename std::enable_if<is_base_template_of<T, jni::HybridClass>::value, int>::type = 0>
  static std::shared_ptr<T> make_shared_from_jni(const jni::global_ref<typename T::javaobject>& ref) {
#ifdef NITRO_DEBUG
    if (ref == nullptr || ref->cthis() == nullptr) [[unlikely]] {
      std::string typeName = TypeInfo::getFriendlyTypename<T>(true);
      throw std::runtime_error("Failed to wrap jni::global_ref<" + typeName + "::javaobject> in std::shared_ptr<" + typeName +
                               "> - it's null!");
    }
#endif

    // Create a shared_ptr with our custom deleter
    std::shared_ptr<T> ptr(ref->cthis(), GlobalRefDeleter<T>(ref));

    // Handle enable_shared_from_this properly if the class supports it
    if constexpr (is_enable_shared_from_this<T>::value) {
      // This is the key part: explicitly initialize the weak_ptr in enable_shared_from_this
      // by using aliasing constructor to create a temporary shared_ptr
      std::shared_ptr<std::enable_shared_from_this<T>>(ptr, static_cast<std::enable_shared_from_this<T>*>(ptr.get()));
    }

    return ptr;
  }
};

} // namespace margelo::nitro
