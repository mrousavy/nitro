//
// Created by Marc Rousavy on 09.02.25.
//

#pragma once

#include <fbjni/fbjni.h>
#include <concepts>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

template <typename Self, typename Base>
std::true_type test_hybrid_class(jni::HybridClass<Self, Base>*);
/* no template */
std::false_type test_hybrid_class(...);
template<typename T>
concept SomeHybridClass = decltype(test_hybrid_class(static_cast<T*>(nullptr)))::value;

template<typename T>
concept SomeJavaObject = std::is_pointer_v<T> && requires(T t) {
  { t->getClass() } -> std::convertible_to<jni::alias_ref<jni::JClass>>;
};

} // namespace margelo::nitro
