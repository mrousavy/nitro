//
// Created by Marc Rousavy on 09.02.25.
//

#pragma once

#include <fbjni/fbjni.h>
#include <concepts>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

template <typename T>
concept SomeHybridClass = std::is_base_of_v<jni::HybridClass<T>, T>;

} // namespace margelo::nitro
